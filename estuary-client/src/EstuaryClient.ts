import {
  EnvironmentName,
  FlagName,
  flagClientMappingSchema,
  FlagClientMapping,
  Span,
  ClientPropMapping,
  FlagClientValue,
} from "@estuary/types";
import { ClientOptions, FlagAttributeMapping, FlagAttributes } from "./clientTypes.js";

const DEFAULT_DURATION = 5 * 60; // 5 minutes

export class EstuaryClient {
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: FlagAttributeMapping,
  ) => void;
  private readonly environment: EnvironmentName;
  // private readonly clientKey: string; // to replace .environment eventually
  private flags: FlagClientMapping = {}; // represents cached data in memory
  private readonly apiUrl: string;
  private intervalId: NodeJS.Timeout | undefined; // necessary for setting/clearing interval
  private attributes: ClientPropMapping;

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
    this.load(this.environment);
  }

  /**
   * Generates an object of attributes for a given flag.
   * For insertion into telemetry data.
   */
  getFlagAttributes(flagName: FlagName): FlagAttributeMapping {
    const flag = this.getFlag(flagName);
    if (!flag) throw new Error(`Flag "${flagName}" not found!`);

    const attributes = {
      'estuary-exp': {
        flagName: {
          ...flag,
        },
      },
    };

    return attributes;
  }

  getAllFlagAttributes(): FlagAttributeMapping {
    const entries = Object.entries(this.flags);
    const transformed = entries.reduce((acc, [flagName, data]) => {
      return { [flagName]: data };
    }, {} as FlagAttributes);

    return { 'estuary-exp': transformed};
  }

  /**
   * Get the current value of a flag
   * @param span a telemetry span object
   * @returns
   */
  // flagValue(flagName: FlagName)
  // flagValue<SpanType extends Span>(flagName: FlagName, span: SpanType)
  flagValue<SpanType extends Span>(
    flagName: FlagName,
    span?: SpanType
  ): null | boolean | number | string {
    const flag = this.getFlag(flagName);
    if (!flag) return null;

    if (span && this.attributeAssignmentCb) {
      const attributes = this.getFlagAttributes(flagName);
      this.attributeAssignmentCb(span, attributes);
    }

    return flag.value;
  }

  private async load(environmentName: string) {
    return this.attemptAndHandleError(async () => {
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          environment: environmentName,
          clientSessionAttributes: this.attributes,
        }),
      };

      const response = await fetch(`${this.apiUrl}`, fetchOptions);
      const fflags: unknown = await response.json();
      const parsed = flagClientMappingSchema.parse(fflags);

      this.flags = { ...this.flags, ...parsed };
      return true;
    });
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  private getFlag(flagName: FlagName): FlagClientValue | undefined {
    const flagContent = this.flags[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  private getAllFlags(): FlagClientMapping {
    return { ...this.flags };
  }

  private async attemptAndHandleError<O, F extends () => O>(
    cb: F,
    cleanupCb?: () => void
  ): Promise<O> {
    try {
      return cb();
    } catch (error) {
      throw new Error(`${new Date()}: ${error}`);
    } finally {
      cleanupCb?.();
    }
  }

  private constructor(options: ClientOptions) {
    this.environment = options.environment;
    this.apiUrl = options.apiUrl;
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    this.attributes = options.attributes;
    if (options.autoRefresh === true) {
      this.startPolling(options.refreshIntervalInSeconds ?? DEFAULT_DURATION);
    }
  }

  private startPolling(intervalInSeconds: number) {
    this.intervalId = setInterval(
      () => this.refresh(),
      intervalInSeconds * 1000
    );
  }
}
