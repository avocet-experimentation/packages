import {
  flagClientMappingSchema,
  FlagClientMapping,
  ClientPropMapping,
  FlagClientValue,
} from "@estuary/types";
import { ClientOptions } from "./clientTypes.js";

const DEFAULT_DURATION_SEC = 5 * 60; // 5 minutes

export class EstuaryClient {
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: Record<string, string>,
  ) => void;
  private readonly environment: string;
  // private readonly clientKey: string; // to replace .environment eventually
  private flagMap: FlagClientMapping = {}; // represents cached data in memory
  private readonly apiUrl: string;
  private intervalId: NodeJS.Timeout | undefined; // necessary for setting/clearing interval
  private clientProps: ClientPropMapping;

  /**
  * Static factory method (no constructor):
    - Allows for more meaningful name when creating the object
    - Async operations, as our loader function will be reading from an external data store
  */
  static async start(options: ClientOptions): Promise<EstuaryClient> {
    const client = new EstuaryClient(options);
    await client.refresh();
    return client;
  }

  // stop refreshing
  stop() {
    clearInterval(this.intervalId);
  }

  /**
   * Refresh local flag data. Must call manually if `autoRefresh` is set to false
   */
  async refresh(): Promise<void> {
    await this.load(this.environment);
  }

  /**
   * Generates an object of attributes for a given flag
   * for insertion into telemetry data.
   */
  getFlagAttributes(flagName: string): Record<string, string> | null {
    const flag = this.getCachedFlagValue(flagName);
    if (!flag) return null;

    // const attributes: FlagAttributes = { 
    //   'feature_flag.key': flagName,
    //   'feature_flag.provider_name': 'estuary-exp',
    //   'feature_flag.variant': String(flag.value),
    //   'feature_flag.hash': String(flag.hash)
    //  }; 

    const attributes = { 
      [`estuary-exp.${flagName}.variant`]: String(flag.value),
      [`estuary-exp.${flagName}.hash`]: String(flag.hash),
     }; 

    return attributes;
  }

  /**
   * Get the last cached value of a flag, saving flag attributes to a span if any is passed
   * and if the client was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   * @returns
   */
  flagValue<SpanType>(
    flagName: string,
    span?: SpanType
  ): null | boolean | number | string {
    const flag = this.getCachedFlagValue(flagName);
    if (!flag) return null;

    if (span && this.attributeAssignmentCb) {
      const attributes = this.getFlagAttributes(flagName);
      if (attributes === null) {
        throw new Error(`Failed to retrieve cached attributes for flag "${flagName}!`);
      }
      this.attributeAssignmentCb(span, attributes);
    }

    return flag.value;
  }

  /**
   * Returns a boolean indicating whether or not it fetched a FlagClientMapping
   */
  private async load(environmentName: string) {
    return this.attemptAndHandleError(async () => {
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          environment: environmentName,
          clientProps: this.clientProps,
        }),
      };

      const response = await fetch(`${this.apiUrl}`, fetchOptions);
      const data: unknown = await response.json();
      const safeParseResult = flagClientMappingSchema.safeParse(data);
      if (safeParseResult.success) {
        this.flagMap = { ...this.flagMap, ...safeParseResult.data };
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  private getCachedFlagValue(flagName: string): FlagClientValue | undefined {
    const flagContent = this.flagMap[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  private getAllCachedFlags(): FlagClientMapping {
    return { ...this.flagMap };
  }

  private async attemptAndHandleError<O, F extends () => O>(
    cb: F,
    cleanupCb?: () => void
  ): Promise<O | undefined> {
    try {
      return cb();
    } catch (error) {
      console.error(`${new Date()}: ${error}`);
    } finally {
      cleanupCb?.();
    }
  }

  private constructor(options: ClientOptions) {
    this.environment = options.environment;
    this.apiUrl = options.apiUrl;
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.clientProps = options.clientProps;
    if (options.autoRefresh === true) {
      this.startPolling(options.refreshIntervalInSeconds ?? DEFAULT_DURATION_SEC);
    }
  }

  private startPolling(intervalInSeconds: number) {
    this.intervalId = setInterval(
      () => this.refresh(),
      intervalInSeconds * 1000
    );
  }
}
