import {
  clientSDKFlagMappingSchema,
  ClientPropMapping,
  ClientSDKFlagValue,
  GeneralRecord,
  FlagCurrentValue,
} from '@avocet/core';
import QuickLRU from 'quick-lru';
import { AttributeCategoryPrefix, ClientOptions } from './clientTypes.js';

const DEFAULTS = {
  REFRESH_INTERVAL_SEC: 5 * 60,
  USE_STALE: true,
};

export class AvocetClient {
  readonly #apiKey: string;

  readonly #apiUrl: string;

  protected attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;

  #cache: QuickLRU<string, ClientSDKFlagValue>;

  #clientProps: ClientPropMapping;

  #intervalId: NodeJS.Timeout | undefined;

  refreshIntervalSec: number;

  #useStale: boolean;

  /** Not to be invoked directly. Use `.start()` instead */
  protected constructor(options: ClientOptions) {
    this.#apiKey = options.apiKey;
    this.#apiUrl = options.apiUrl;
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.#cache = new QuickLRU({
      maxSize: 10,
    });
    this.#clientProps = options.clientProps;
    this.refreshIntervalSec = options.refreshIntervalInSeconds ?? DEFAULTS.REFRESH_INTERVAL_SEC;
    this.#useStale = options.useStale ?? DEFAULTS.USE_STALE;
  }

  /**
   * Async factory method that fetches and caches flag data before returning
   */
  static async start(options: ClientOptions): Promise<AvocetClient> {
    const client = new AvocetClient(options);
    await client.fetchAllFlags();
    if (options.autoRefresh === true) {
      client.startPolling();
    }
    return client;
  }

  /**
   * Get the cached value of a flag, saving attributes to a span if one is
   * passed and if the client was instantiated with an attribute assignment
   * callback.
   * @param span A telemetry span to pass into the attribute assignment calback
   * @param clientProps An object of client properties to assign to the span
   * @returns The value of the flag, or null if no matching flag is found
   */
  get<SpanType>(flagName: string, span?: SpanType): null | FlagCurrentValue {
    try {
      const flagData = this.#cache.get(flagName);
      if (!flagData) throw new Error(`No cached data for flag "${flagName}"`);

      if (span && this.attributeAssignmentCb) {
        const attributes = this.getAttributes(flagName, flagData);
        this.attributeAssignmentCb(attributes, span);
      }
      return flagData.value;
    } catch (_e) {
      return null;
    }
  }

  /**
   * Asynchronously get the latest value of a flag
   */
  async getLive<SpanType>(
    flagName: string,
    span?: SpanType,
  ): Promise<null | FlagCurrentValue> {
    await this.fetchFlag(flagName);
    return this.get(flagName, span);
  }

  startPolling(intervalInSeconds?: number) {
    if (intervalInSeconds) this.refreshIntervalSec = intervalInSeconds;
    const refreshIntervalMs = this.refreshIntervalSec * 1000;
    this.#intervalId = setInterval(
      () => this.fetchAllFlags(),
      refreshIntervalMs,
    );
  }

  stopPolling() {
    clearInterval(this.#intervalId);
  }

  getWithAttributes(
    flagName: string,
  ): { value: FlagCurrentValue; attributes: Record<string, string> } | null {
    const flagData = this.#cache.get(flagName);
    if (!flagData || !flagData.value) return null;
    return {
      value: flagData.value,
      attributes: this.getAttributes(flagName, flagData),
    };
  }

  protected getAttributes(flagName: string, flagData: ClientSDKFlagValue) {
    return {
      ...AvocetClient.formatFlagAttributes(flagName, flagData),
      ...AvocetClient.formatClientProps(this.#clientProps),
    };
  }

  protected async fetchFlag(flagName: string) {
    return this.fetchAndCache(
      {
        apiKey: this.#apiKey,
        clientProps: this.#clientProps,
        flagName,
      },
      'api/fflag',
    );
  }

  protected async fetchAllFlags() {
    return this.fetchAndCache(
      {
        apiKey: this.#apiKey,
        clientProps: this.#clientProps,
      },
      'api/fflags',
    );
  }

  /**
   * Helper for fetching, parsing, and caching flag data.
   * @returns a boolean indicating whether or not it fetched valid data
   */
  protected async fetchAndCache(
    body: { apiKey: string; clientProps: ClientPropMapping; flagName?: string },
    path: string,
  ) {
    if (!this.#useStale) {
      if (body.flagName !== undefined) this.#cache.delete(body.flagName);
      else this.#cache.clear();
    }

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(`${this.#apiUrl}/${path}`, fetchOptions);
      if (!response.ok) return false;

      const parsedBody: unknown = await response.json();
      const flagMapping = clientSDKFlagMappingSchema.parse(parsedBody);
      const entries = Object.entries(flagMapping);
      if (this.#cache.maxSize < entries.length) {
        this.#cache.resize(entries.length);
      }
      Object.entries(flagMapping).forEach(([flagName, data]) =>
        this.#cache.set(flagName, data));
      return true;
    } catch (_e) {
      return false;
    }
  }

  /**
   * @param attributeName An optional name to insert between the category
   * prefix and each attribute key
   * @returns a flat attributes object formatted for insertion into telemetry
   * data
   */
  protected static formatAttributes(
    categoryPrefix: AttributeCategoryPrefix,
    attributeName: string | null,
    attributes: GeneralRecord,
  ): Record<string, string> {
    const prefixes: string[] = [categoryPrefix];
    if (attributeName) prefixes.push(attributeName);
    const fullPrefix = prefixes.join('.');

    const formattedPropEntries = Object.entries(attributes).map(
      ([key, value]) => [`avocet.${fullPrefix}.${key}`, String(value)],
    );

    return Object.fromEntries(formattedPropEntries);
  }

  protected static formatFlagAttributes(
    flagName: string,
    flag: ClientSDKFlagValue,
  ): Record<string, string> {
    return AvocetClient.formatAttributes('feature-flag', flagName, flag);
  }

  protected static formatClientProps(
    clientProps: ClientPropMapping,
  ): Record<string, string> {
    return AvocetClient.formatAttributes('client-prop', null, clientProps);
  }
}
