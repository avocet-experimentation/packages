import {
  clientSDKFlagMappingSchema,
  ClientSDKFlagMapping,
  ClientPropMapping,
  ClientSDKFlagValue,
  GeneralRecord,
} from '@avocet/core';
import { AttributeCategoryPrefix, ClientOptions } from './clientTypes.js';

const DEFAULT_DURATION_SEC = 5 * 60;

export class AvocetClient {
  private attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;

  refreshIntervalInSeconds: number;

  readonly #apiKey: string;

  #flagMap: ClientSDKFlagMapping = {};

  readonly #apiUrl: string;

  #intervalId: NodeJS.Timeout | undefined;

  #clientProps: ClientPropMapping;

  /** Not to be invoked directly. Use `.start()` instead */
  private constructor(options: ClientOptions) {
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.refreshIntervalInSeconds = options.refreshIntervalInSeconds ?? DEFAULT_DURATION_SEC;
    this.#apiKey = options.apiKey;
    this.#apiUrl = options.apiUrl;
    this.#clientProps = options.clientProps;
    if (options.autoRefresh === true) {
      this.startPolling(
        options.refreshIntervalInSeconds ?? DEFAULT_DURATION_SEC,
      );
    }
  }

  /**
   * Async factory method that fetches and caches flag data before returning
   */
  static async start(options: ClientOptions): Promise<AvocetClient> {
    const client = new AvocetClient(options);
    await client.load();
    return client;
  }

  /**
   * @param attributeName An optional name to insert between the category
   * prefix and each attribute key
   * @returns a flat attributes object formatted for insertion into telemetry
   * data
   */
  private formatAttributes(
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

  private formatFlagAttributes(
    flagName: string,
    flag: ClientSDKFlagValue,
  ): Record<string, string> {
    return this.formatAttributes('feature-flag', flagName, flag);
  }

  private formatClientProps(
    clientProps: ClientPropMapping,
  ): Record<string, string> {
    return this.formatAttributes('client-prop', null, clientProps);
  }

  /**
   * Get the last cached value of a flag, saving attributes to a span if one is passed
   * and if the client was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   * @returns
   */
  get<SpanType>(
    flagName: string,
    span?: SpanType,
  ): null | boolean | number | string {
    return this.#getFlagValueAndAttributes(flagName, span, null);
  }

  /** (WIP) get a flag value, passing in client properties instead of using pre-defined ones
   * Useful for server-side SDK instances that serve multiple clients
   * Saves flag attributes to a span if any is passed
   * and if the SDK was instantiated with an attribute assignment callback.
   * @param span a telemetry span
   */
  getWithProps<SpanType>(
    flagName: string,
    clientProps: ClientPropMapping,
    span?: SpanType,
  ): null | boolean | number | string {
    return this.#getFlagValueAndAttributes(flagName, span, clientProps);
  }

  /**
   * @param span A telemetry span to pass into the attribute assignment calback
   * @param clientProps An object of client properties to assign to the span
   * @returns The value of the flag, or null if no matching flag is found
   */
  #getFlagValueAndAttributes<SpanType>(
    flagName: string,
    span?: SpanType,
    clientProps?: ClientPropMapping | null,
  ): null | boolean | number | string {
    try {
      const flagData = this.getCachedFlagData(flagName);
      if (!flagData) throw new Error(`No cached data for flag "${flagName}"`);

      if (span && this.attributeAssignmentCb) {
        const flagAttributes = this.formatFlagAttributes(flagName, flagData);
        const attributes = { ...flagAttributes };
        const rawClientProps = clientProps === null ? this.#clientProps : clientProps;
        if (rawClientProps) {
          const formattedClientProps = this.formatClientProps(rawClientProps);
          Object.assign(attributes, formattedClientProps);
        }
        this.attributeAssignmentCb(attributes, span);
      }
      return flagData.value;
    } catch (_e) {
      return null;
    }
  }

  /**
   * Returns a boolean indicating whether or not it fetched a FlagClientMapping
   */
  private async load() {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        apiKey: this.#apiKey,
        clientProps: this.#clientProps,
      }),
    };

    const response = await fetch(`${this.#apiUrl}/api/fflags`, fetchOptions);
    if (!response.ok) {
      return false;
    }
    const data: unknown = await response.json();
    const safeParseResult = clientSDKFlagMappingSchema.safeParse(data);
    if (safeParseResult.success) {
      this.#flagMap = { ...this.#flagMap, ...safeParseResult.data };
      return true;
    }
    return false;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  private getCachedFlagData(flagName: string): ClientSDKFlagValue | undefined {
    const flagContent = this.#flagMap[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllCachedFlags(): ClientSDKFlagMapping {
    return { ...this.#flagMap };
  }

  private startPolling(intervalInSeconds?: number) {
    const refreshIntervalMs = (intervalInSeconds ?? this.refreshIntervalInSeconds) * 1000;
    this.#intervalId = setInterval(() => this.load(), refreshIntervalMs);
  }

  cancelPolling() {
    clearInterval(this.#intervalId);
  }
}
