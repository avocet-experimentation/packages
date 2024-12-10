import {
  flagClientMappingSchema,
  FlagClientMapping,
  ClientPropMapping,
  FlagClientValue,
} from '@estuary/types';
import { ClientOptions } from './clientTypes.js';

const DEFAULT_DURATION_SEC = 5 * 60; // 5 minutes

const APP_NAME = 'estuary-exp';

export class EstuaryClient {
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: Record<string, string>
  ) => void;

  private readonly environmentName: string;

  // private readonly clientKey: string; // to replace .environmentName eventually
  private flagMap: FlagClientMapping = {}; // represents cached data in memory

  private readonly apiUrl: string;

  private intervalId: NodeJS.Timeout | undefined; // necessary for setting/clearing interval

  private clientProps: ClientPropMapping;

  /** Not to be invoked directly. Use `.start()` instead */
  private constructor(options: ClientOptions) {
    this.environmentName = options.environmentName;
    this.apiUrl = options.apiUrl;
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.clientProps = options.clientProps;
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
   * Generates an object of attributes for a given flag
   * for insertion into telemetry data.
   */
  getFlagAttributes(flagName: string): Record<string, string> | null {
    const flag = this.getCachedFlagData(flagName);
    if (!flag) return null;

    const attributes = {
      [`${APP_NAME}.feature-flag.${flagName}.value`]: String(flag.value),
      [`${APP_NAME}.feature-flag.${flagName}.metadata`]: String(flag.metadata),
    };

    return attributes;
  }

  getClientProps(): Record<string, string> {
    const userProps = Object.entries(this.clientProps).map(([key, value]) => [
      `${APP_NAME}.client-prop.${key}`,
      String(value),
    ]);

    return Object.fromEntries(userProps);
  }

  /**
   * Get the last cached value of a flag, saving flag attributes to a span if any is passed
   * and if the client was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   * @returns
   */
  flagValue<SpanType>(
    flagName: string,
    span?: SpanType,
  ): null | boolean | number | string {
    const flagData = this.getCachedFlagData(flagName);
    if (!flagData) return null;

    if (span && this.attributeAssignmentCb) {
      const flagAttributes = this.getFlagAttributes(flagName);
      if (flagAttributes === null) {
        throw new Error(
          `Failed to retrieve cached attributes for flag "${flagName}!`,
        );
      }
      const userProps = Object.entries(this.clientProps).map(([key, value]) => [
        `${APP_NAME}.client-prop.${key}`,
        String(value),
      ]);
      const attributes = {
        ...flagAttributes,
        ...Object.fromEntries(userProps),
      };
      this.attributeAssignmentCb(span, attributes);
    }

    return flagData.value;
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
        environmentName: this.environmentName,
        clientProps: this.clientProps,
      }),
    };

    const response = await fetch(
      `${this.apiUrl}/api/fflags/caching`,
      fetchOptions,
    );
    if (!response.ok) {
      return false;
    }
    const data: unknown = await response.json();
    const safeParseResult = flagClientMappingSchema.safeParse(data);
    if (safeParseResult.success) {
      this.flagMap = { ...this.flagMap, ...safeParseResult.data };
      return true;
    }
    return false;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  private getCachedFlagData(flagName: string): FlagClientValue | undefined {
    const flagContent = this.flagMap[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllCachedFlags(): FlagClientMapping {
    return { ...this.flagMap };
  }

  private startPolling(intervalInSeconds: number) {
    this.intervalId = setInterval(() => this.load(), intervalInSeconds * 1000);
  }

  cancelPolling() {
    clearInterval(this.intervalId);
  }
}
