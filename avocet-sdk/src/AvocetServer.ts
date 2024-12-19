import {
  ClientPropMapping,
  FlagCurrentValue,
  FeatureFlag,
  Experiment,
  serverSDKFlagMappingSchema,
  ClientSDKFlagValue,
} from '@avocet/core';
import { AvocetServerOptions } from './sdk-types.js';
import AvocetSDKBase from './AvocetSDKBase.js';
import { DEFAULT_OPTIONS } from './default-options.js';

/**
 * Common logic for client and server SDK classes
 * todo:
 * - remove non-shared methods
 */
export default class AvocetServer extends AvocetSDKBase {
  protected flagCache: Record<string, FeatureFlag> = {};

  protected experimentCache: Record<string, Experiment> = {};

  /** Not to be invoked directly. Use `.start()` instead */
  protected constructor(options: AvocetServerOptions) {
    const withDefaults = { ...DEFAULT_OPTIONS, ...options };
    super(withDefaults);
    if (withDefaults.autoRefresh) {
      this.startPolling(this.autoRefreshInterval);
    }
  }

  /**
  * Static factory method (no constructor):
    - Allows for more meaningful name when creating the object
    - Async operations, as our loader function will be reading from an external data store
  */
  static async start(options: AvocetServerOptions): Promise<AvocetServer> {
    const client = new AvocetServer(options);
    await client.fetchAllFlags();
    return client;
  }

  /** (WIP)
   * Get the cached value of a flag, saving attributes to a span if passed and
   * if the SDK was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   *
   * todo:
   * - calculate override rule logic before returning
   */
  get<SpanType>(
    flagName: string,
    clientProps: ClientPropMapping,
    span?: SpanType,
  ): null | FlagCurrentValue {
    return this.getFlagValueAndAssignAttributes(flagName, clientProps, span);
  }

  /**
   * Fetch the latest value of a flag, saving attributes to a span if one is passed
   * and if the client was instantiated with an attribute assignment callback.
   * @param span a telemetry span object
   * @returns
   */
  async getLive<SpanType>(
    flagName: string,
    clientProps: ClientPropMapping,
    span?: SpanType,
  ): Promise<null | FlagCurrentValue> {
    await this.fetchFlag(flagName, clientProps);
    return this.getFlagValueAndAssignAttributes(flagName, clientProps, span);
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllCachedFlags(): Record<string, FeatureFlag> {
    return { ...this.flagCache };
  }

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
   * @param clientProps An object of client properties to assign to the span, or
   * `null` if client props stored on the instance should be used instead.
   * @returns The value of the flag, or null if no matching flag is found
   */
  protected getFlagValueAndAssignAttributes<SpanType>(
    flagName: string,
    clientProps: ClientPropMapping,
    span?: SpanType,
  ): null | FlagCurrentValue {
    try {
      const flag = this.getCachedFlagData(flagName);
      if (!flag) throw new Error(`No cached data for flag "${flagName}"`);

      const flagClientValue = this.calculateFlagClientValue(flag, clientProps);

      if (span && this.attributeAssignmentCb) {
        const attributes = {
          ...AvocetServer.formatFlagAttributes(flagName, flagClientValue),
          ...AvocetServer.formatClientProps(clientProps),
        };

        this.attributeAssignmentCb(attributes, span);
      }
      return flagClientValue.value;
    } catch (_e) {
      return null;
    }
  }

  protected calculateFlagClientValue(
    flag: FeatureFlag,
    clientProps: ClientPropMapping,
  ): ClientSDKFlagValue {}

  // /**
  //  * Returns a flat attributes object formatted for insertion into telemetry data
  //  * @param attributeName An optional name to insert between the category prefix and the key
  //  * @returns
  //  */
  // protected formatAttributes(
  //   categoryPrefix: AttributeCategoryPrefix,
  //   attributeName: string | null,
  //   attributeMapping: GeneralRecord,
  // ): Record<string, string> {
  //   const prefixes = [this.attributeAppPrefix, categoryPrefix];
  //   if (attributeName) prefixes.push(attributeName);
  //   const fullPrefix = prefixes.join('.');

  //   const formattedPropEntries = Object.entries(attributeMapping).map(
  //     ([key, value]) => [`${fullPrefix}.${key}`, String(value)],
  //   );

  //   return Object.fromEntries(formattedPropEntries);
  // }

  // protected formatFlagAttributes(
  //   flagName: string,
  //   flag: FlagClientValue,
  // ): Record<string, string> {
  //   return this.formatAttributes('feature-flag', flagName, flag);
  // }

  // protected formatClientProps(
  //   clientProps: ClientPropMapping,
  // ): Record<string, string> {
  //   return this.formatAttributes('client-prop', null, clientProps);
  // }

  // protected async fetchFrom(path: string, body: object) {
  //   const fetchOptions = {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json; charset=utf-8',
  //     },
  //     body: JSON.stringify(body),
  //   };

  //   const response = await fetch(`${this.apiUrl}/${path}`, fetchOptions);
  //   if (!response.ok) {
  //     return response;
  //   }

  //   const data = await response.json();
  //   return {
  //     ...response,
  //     ok: true,
  //     body: data,
  //   };
  // }

  protected async fetchFlag(flagName: string, clientProps: ClientPropMapping) {
    if (this.discardStaleFlags) {
      delete this.flagCache[flagName];
    }

    const response = await this.fetchFrom('api/server/fflag', {
      environmentName: this.environmentName,
      clientProps,
      flagName,
    });

    if (!response.ok) {
      return false;
    }

    const safeParseResult = serverSDKFlagMappingSchema.safeParse(response.body);
    if (!safeParseResult.success) {
      return false;
    }

    this.flagCache = { ...this.flagCache, ...safeParseResult.data };
    return true;
  }

  /**
   * Fetch and cache all feature flags.
   * @returns a boolean indicating whether or not it fetched a valid
   * `FlagClientMapping`
   */
  protected async fetchAllFlags(clientProps?: ClientPropMapping) {
    if (this.discardStaleFlags) {
      this.flagCache = {};
    }

    const response = await this.fetchFrom('api/server/all-fflags', {
      environmentName: this.environmentName,
      clientProps,
    });
    if (!response.ok) {
      return false;
    }

    const safeParseResult = serverSDKFlagMappingSchema.safeParse(response.body);
    if (safeParseResult.success) {
      this.flagCache = { ...this.flagCache, ...safeParseResult.data };
      return true;
    }
    return false;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  protected getCachedFlagData(flagName: string): FeatureFlag | undefined {
    const flagContent = this.flagCache[flagName];
    return { ...flagContent };
  }
}
