import {
  flagClientMappingSchema,
  FlagClientMapping,
  ClientPropMapping,
  FlagClientValue,
  GeneralRecord,
} from '@estuary/types';
import { AttributeCategoryPrefix, ClientOptions } from './clientTypes.js';

const DEFAULT_DURATION_SEC = 5 * 60;

// placeholder - either hardcode or remove
const APP_NAME = 'estuary-exp';

export class EstuaryClient {
  private attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;

  readonly #attributeAppPrefix: string;

  refreshIntervalInSeconds: number;

  readonly #environmentName: string; // placeholder until API keys

  // private readonly clientKey: string; // to replace .environmentName eventually
  #flagMap: FlagClientMapping = {}; // represents cached data in memory

  readonly #apiUrl: string;

  #intervalId: NodeJS.Timeout | undefined; // necessary for setting/clearing interval

  #clientProps: ClientPropMapping;

  /** Not to be invoked directly. Use `.start()` instead */
  private constructor(options: ClientOptions) {
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.#attributeAppPrefix = options.attributePrefix ?? APP_NAME;
    this.refreshIntervalInSeconds = options.refreshIntervalInSeconds ?? DEFAULT_DURATION_SEC;
    this.#environmentName = options.environmentName;
    this.#apiUrl = options.apiUrl;
    this.#clientProps = options.clientProps;
    if (options.autoRefresh === true) {
      this.startPolling(
        options.refreshIntervalInSeconds ?? DEFAULT_DURATION_SEC,
      );
    }
  }

  /**
  * Static factory method (no constructor):
    - Allows for more meaningful name when creating the object
    - Async operations, as our loader function will be reading from an external data store
  */
  static async start(options: ClientOptions): Promise<EstuaryClient> {
    const client = new EstuaryClient(options);
    await client.load();
    return client;
  }

  /**
   * Returns a flat attributes object formatted for insertion into telemetry data
   * @param attributes
   * @param attributeName An optional name to insert between the category prefix and the key
   * @returns
   */
  private formatAttributes(
    categoryPrefix: AttributeCategoryPrefix,
    attributeName: string | null,
    attributes: GeneralRecord,
  ): Record<string, string> {
    const prefixes = [this.#attributeAppPrefix, categoryPrefix];
    if (attributeName) prefixes.push(attributeName);
    const fullPrefix = prefixes.join('.');

    const formattedPropEntries = Object.entries(attributes).map(
      ([key, value]) => [`${fullPrefix}.${key}`, String(value)],
    );

    return Object.fromEntries(formattedPropEntries);
  }

  private formatFlagAttributes(
    flagName: string,
    flag: FlagClientValue,
  ): Record<string, string> {
    return this.formatAttributes('feature-flag', flagName, flag);
    // const attributes = {
    //   [`${this.#attributeAppPrefix}.feature-flag.${flagName}.value`]: String(
    //     flag.value,
    //   ),
    //   [`${this.#attributeAppPrefix}.feature-flag.${flagName}.metadata`]: String(
    //     flag.metadata,
    //   ),
    // };

    // return attributes;
  }

  /**
   * Generates an object of attributes for a given flag
   * for insertion into telemetry data.
   */
  // getFlagAttributes(flagName: string): Record<string, string> | null {
  //   const flagData = this.getCachedFlagData(flagName);
  //   if (!flagData) return null;

  //   return this.formatFlagAttributes(flagName, flagData);
  // }

  private formatClientProps(
    clientProps: ClientPropMapping,
  ): Record<string, string> {
    return this.formatAttributes('client-prop', null, clientProps);
    // const userProps = Object.entries(clientProps).map(([key, value]) => [
    //   `${this.#attributeAppPrefix}.client-prop.${key}`,
    //   String(value),
    // ]);

    // return Object.fromEntries(userProps);
  }

  // get clientProps(): Record<string, string> {
  //   return this.formatClientProps(this.#clientProps);
  // }

  // getAllAttributes(flagName: string): Record<string, string> {
  //   const flagAttributes = this.getFlagAttributes(flagName);
  //   if (flagAttributes === null) {
  //     throw new Error(
  //       `Failed to retrieve cached attributes for flag "${flagName}!`,
  //     );
  //   }
  //   const userProps = Object.entries(this.clientProps).map(([key, value]) => [
  //     `${this.attributePrefix}.client-prop.${key}`,
  //     String(value),
  //   ]);
  //   const attributes = {
  //     ...flagAttributes,
  //     ...(Object.fromEntries(userProps) as Record<string, string>),
  //   };

  //   return attributes;
  // }

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
    // try {
    //   const flagData = this.getCachedFlagData(flagName);
    //   if (!flagData) throw new Error(`No cached data for flag "${flagName}"`);

    //   if (span && this.attributeAssignmentCb) {
    //     const attributes = this.getAllAttributes(flagName);
    //     this.attributeAssignmentCb(attributes, span);
    //   }
    //   return flagData.value;
    // } catch (e) {
    //   return null;
    // }
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
    // try {
    //   const flagData = this.getCachedFlagData(flagName);
    //   if (!flagData) throw new Error(`No cached data for flag "${flagName}"`);

    //   if (span && this.attributeAssignmentCb) {
    //     const attributes = this.getAllAttributes(flagName);
    //     this.attributeAssignmentCb(attributes, span);
    //   }
    //   return flagData.value;
    // } catch (e) {
    //   return null;
    // }
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
    } catch (e) {
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
        environmentName: this.#environmentName,
        clientProps: this.#clientProps,
      }),
    };

    const response = await fetch(
      `${this.#apiUrl}/api/fflags/caching`,
      fetchOptions,
    );
    if (!response.ok) {
      return false;
    }
    const data: unknown = await response.json();
    const safeParseResult = flagClientMappingSchema.safeParse(data);
    if (safeParseResult.success) {
      this.#flagMap = { ...this.#flagMap, ...safeParseResult.data };
      return true;
    }
    return false;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  private getCachedFlagData(flagName: string): FlagClientValue | undefined {
    const flagContent = this.#flagMap[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllCachedFlags(): FlagClientMapping {
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
