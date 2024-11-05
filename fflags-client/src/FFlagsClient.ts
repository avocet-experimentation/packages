/*
  Responsible for:
    - Loading the feature flags from a data source
    - Refresh them from time to time
    - Retrieve a flag using its name and user group name

  Problem:
    Implementing the loader function inside our class requires us to preemptively decide which data source we want to use and commit to that source. This would require us to implement *different* loaders for *different* data sources.

  Open-closed principle:
    Avoid modifying our class each time we want to read from a data source.

  Solution:
    Different loaders for different data sources that are totally independent of the class.
  
  Implementation:
    Implement loader outside our class and then inject it into the constructor using dependency injection.
*/

import {
  FlagEnvironmentName,
  FlagName,
  FeatureFlagClientData,
  Span,
} from "@fflags/types";
import {
  Attributes,
  ClientOptions,
  ClientFlagMapping,
} from "./clientTypes.js";

const DEFAULT_DURATION = 5 * 60; // 5 min

export class FFlagsClient {
  // autoAddSpanAttributes: boolean;
  attributeAssignmentCb?: <SpanType>(span: SpanType, attributes: Attributes) => void;
  private readonly environment: FlagEnvironmentName;
  // private readonly clientKey: string; // to replace .environment eventually
  private flags: ClientFlagMapping = {}; // represents cached data in memory
  private readonly apiUrl: string;
  private intervalId: NodeJS.Timeout | undefined; // necessary for setting/clearing interval

 /**
  * Static factory method (no constructor):
    - Allows for more meaningful name when creating the object
    - Async operations, as our loader function will be reading from an external data store
  */
  static async start(
    options: ClientOptions
  ): Promise<FFlagsClient> {
    const client = new FFlagsClient(options);
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
   * Retrieve a copy of cached data for the specified flag
   */
  getFlag(flagName: FlagName): FeatureFlagClientData | undefined {
    const flagContent = this.flags[flagName];
    return { ...flagContent };
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllFlags(): ClientFlagMapping {
    return { ...this.flags };
  }

  /**
   * Generates an object of attributes for a given flag.
   * For insertion into telemetry data.
   */
  getFlagAttributes(flagName: FlagName): Attributes {
    const flag = this.getFlag(flagName);
    if (!flag) throw new Error(`Flag "${flagName}" not found!`);

    const attributes: Attributes = {
      featureFlags: [
        {
          key: flagName,
          providerName: 'Field-Trip',
          valueType: flag.valueType,
          value: flag.currentValue,
        },
      ],
    };

    return attributes;
  }

  getAllFlagAttributes(): Attributes[] {
    const flagNames = Object.keys(this.flags);
    return flagNames.map((name) => this.getFlagAttributes(name));
  }

  /**
   * Get the current value of a flag
   * @param span a telemetry span object
   * @returns 
   */
  // flagValue(flagName: FlagName)
  // flagValue<SpanType extends Span>(flagName: FlagName, span: SpanType)
  flagValue<SpanType extends Span>(flagName: FlagName, span?: SpanType): null | boolean | number | string {
    const flag = this.getFlag(flagName);
    if (!flag) return null;

    if (span) {
      const attributes = this.getFlagAttributes(flagName);
      this.attributeAssignmentCb?.(span, attributes);
    }
    
    // handle various flag types
    if (flag.valueType === 'boolean') {
      return Boolean(flag.currentValue);
    } else if (flag.valueType === 'number') {
      return Number(flag.currentValue);
    } else if (flag.valueType === 'string') {
      return String(flag.currentValue);
    }

    return null; // todo: remove this after solving exhaustiveness check error
  }

  private async load(environmentName: string) {
    return this.attemptAndHandleError(async () => {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ environment: environmentName }),
      };

      const response = await fetch(`${this.apiUrl}`, fetchOptions);
      const fflags: unknown = await response.json();
      this.assertFlagMapping(fflags); // placeholder runtime type validation

      this.flags = { ...this.flags, ...fflags };
      return true;
    });
  }

  private async attemptAndHandleError<O, F extends () => O>(cb: F, cleanupCb?: () => void): Promise<O> {
    try {
      return cb();
    } catch(error) {
      throw new Error(`${new Date()}: ${error}`);
    } finally {
      cleanupCb?.();
    }
  }

  private constructor(options: ClientOptions) {
    this.environment = options.environment;
    this.apiUrl = options.apiUrl;
    // this.autoAddSpanAttributes = options.autoAddSpanAttributes;
    this.attributeAssignmentCb = options.attributeAssignmentCb;
    if (options.autoRefresh) {
      this.startPolling(options.refreshIntervalInSeconds ?? DEFAULT_DURATION);
    }
  }

  private startPolling(intervalInSeconds: number) {
    // setInterval delay expects value in ms
    this.intervalId = setInterval(
      () => void this.refresh(),
      intervalInSeconds * 1000
    );
  }
  
  // placeholder
  private assertFlagMapping(arg: unknown): asserts arg is ClientFlagMapping {
    if (!arg 
      || typeof arg !== 'object' 
      || Array.isArray(arg)
    ) {
      throw new TypeError(`Arg ${arg} is not a ClientFlagMapping`);
    }
  }
}