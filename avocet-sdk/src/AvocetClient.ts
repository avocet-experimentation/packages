import {
  clientSDKFlagMappingSchema,
  ClientSDKFlagMapping,
  ClientPropMapping,
  ClientSDKFlagValue,
  FlagCurrentValue,
} from '@avocet/core';
import { AvocetClientOptions } from './sdk-types.js';
import { DEFAULT_OPTIONS } from './default-options.js';
import AvocetSDKBase from './AvocetSDKBase.js';

export class AvocetClient extends AvocetSDKBase {
  protected clientProps: ClientPropMapping;

  /** Flag data cached in memory */
  protected flagCache: ClientSDKFlagMapping = {};

  /** Not to be invoked directly. Use `.start()` instead */
  protected constructor(options: AvocetClientOptions) {
    const withDefaults = { ...DEFAULT_OPTIONS, ...options };
    super(withDefaults);

    this.clientProps = withDefaults.clientProps;
  }

  // /**
  // * Static factory method (no constructor):
  //   - Allows for more meaningful name when creating the object
  //   - Async operations, as our loader function will be reading from an external data store
  // */
  // static async start(options: AvocetClientOptions): Promise<AvocetClient> {
  //   const client = new AvocetClient(options);
  //   await client.fetchAllFlags();
  //   return client;
  // }

  /**
   * Get the cached value of a flag, saving attributes to a span if passed and
   * if the SDK was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   */
  get<SpanType>(flagName: string, span?: SpanType): null | FlagCurrentValue {
    return this.getFlagValueAndAssignAttributes(flagName, span);
  }

  /**
   * Fetch the latest value of a flag, saving attributes to a span if one is passed
   * and if the client was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   * @param clientProps if passed, is used instead of  props
   * @returns
   */
  async getLive<SpanType>(
    flagName: string,
    span?: SpanType,
  ): Promise<null | FlagCurrentValue> {
    await this.fetchFlag(flagName);
    return this.getFlagValueAndAssignAttributes(flagName, span);
  }

  // /**
  //  * @returns a copy of all locally stored flags
  //  */
  // getAllCachedFlags(): ClientSDKFlagMapping {
  //   return { ...this.flagCache };
  // }

  startPolling(intervalInSeconds?: number) {
    const refreshIntervalMs = (intervalInSeconds ?? this.autoRefreshInterval) * 1000;
    this.intervalId = setInterval(
      () => this.fetchAllFlags(),
      refreshIntervalMs,
    );
  }

  stopPolling() {
    clearInterval(this.intervalId);
  }

  /**
   * Get cached data for the specified flag.
   * If a span is passed and an attribute assignment callback is defined, the
   * callback is invoked, passing in an attributes object containing the flag's
   * attributes.
   *
   * If client properties are passed, they are also added to the attributes
   * object passed into the callback.
   *
   * @param span A telemetry span to pass into the attribute assignment calback
   * @param clientProps An object of client properties to assign to the span., or
   * `null` if client props stored on the instance should be used instead.
   * @returns The value of the flag, or null if no matching flag is found
   */
  protected getFlagValueAndAssignAttributes<SpanType>(
    flagName: string,
    span?: SpanType,
  ): null | FlagCurrentValue {
    try {
      const flagData = this.getCachedFlagData(flagName);
      if (!flagData) throw new Error(`No cached data for flag "${flagName}"`);

      if (span && this.attributeAssignmentCb) {
        const attributes = {
          ...AvocetClient.formatFlagAttributes(flagName, flagData),
          ...AvocetClient.formatClientProps(this.clientProps),
        };

        this.attributeAssignmentCb(attributes, span);
      }
      return flagData.value;
    } catch (_e) {
      return null;
    }
  }

  protected async fetchFlag(flagName: string) {
    if (this.discardStaleFlags) {
      delete this.flagCache[flagName];
    }

    const response = await this.fetchFrom('api/fflag', {
      environmentName: this.environmentName,
      clientProps: this.clientProps,
      flagName,
    });

    if (!response.ok) {
      return false;
    }

    const safeParseResult = clientSDKFlagMappingSchema.safeParse(response.body);
    if (!safeParseResult.success) {
      return false;
    }

    this.flagCache = { ...this.flagCache, ...safeParseResult.data };
    return true;
  }

  /**
   * Fetch and locally cache the values for all feature flags.
   * @returns a boolean indicating whether or not it fetched a valid
   * `ClientSDKFlagMapping`
   */
  protected async fetchAllFlags() {
    if (this.discardStaleFlags) {
      this.flagCache = {};
    }

    const response = await this.fetchFrom('api/fflags', {
      environmentName: this.environmentName,
      clientProps: this.clientProps,
    });
    if (!response.ok) {
      return false;
    }

    const safeParseResult = clientSDKFlagMappingSchema.safeParse(response.body);
    if (safeParseResult.success) {
      this.flagCache = { ...this.flagCache, ...safeParseResult.data };
      return true;
    }
    return false;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  protected getCachedFlagData(
    flagName: string,
  ): ClientSDKFlagValue | undefined {
    const flagContent = this.flagCache[flagName];
    return { ...flagContent };
  }
}
