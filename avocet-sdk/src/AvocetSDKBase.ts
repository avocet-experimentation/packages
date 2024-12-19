import {
  GeneralRecord,
  ClientSDKFlagValue,
  ClientPropMapping,
} from '@avocet/core';
import { AttributeCategoryPrefix, AvocetSDKOptions } from './sdk-types.js';
import { DEFAULT_OPTIONS } from './default-options.js';

/**
 * Common logic for client and server SDK classes
 * todo:
 * - remove non-shared methods
 */
export default class AvocetSDKBase {
  protected readonly apiUrl: string;

  // protected readonly apiKey: string; // to replace .environmentName
  protected readonly environmentName: string; // placeholder until API keys

  protected attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;

  /** If set false, previously cached flag values will be discarded when
   * attempting to fetch */
  protected discardStaleFlags: boolean;

  /**
   * The latency in seconds between automatic flag fetches. Defaults to
   * `300` (five minutes).
   */
  autoRefreshInterval: number;

  /** Flag data cached in memory */
  protected flagCache: GeneralRecord = {};

  /** Used to stop auto-refreshing */
  protected intervalId: NodeJS.Timeout | undefined;

  protected constructor(options: AvocetSDKOptions) {
    const optionsWithDefaults = { ...DEFAULT_OPTIONS, ...options };

    this.attributeAssignmentCb = optionsWithDefaults.attributeAssignmentCb;
    this.discardStaleFlags = optionsWithDefaults.discardStaleFlags;
    this.autoRefreshInterval = optionsWithDefaults.autoRefreshInterval;
    this.environmentName = optionsWithDefaults.environmentName;
    this.apiUrl = optionsWithDefaults.apiUrl;
    if (optionsWithDefaults.autoRefresh) {
      this.startPolling(this.autoRefreshInterval);
    }
  }

  /**
   * @returns a copy of all locally stored flags
   */
  getAllCachedFlags() {
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
   * Returns a flat attributes object formatted for insertion into telemetry data
   * @param attributeName An optional name to insert between the category prefix and the key
   * @returns
   */
  protected static toFlatAttributes(
    categoryPrefix: AttributeCategoryPrefix,
    attributeName: string | null,
    attributeMapping: GeneralRecord,
  ): Record<string, string> {
    const prefixes: string[] = [categoryPrefix];
    if (attributeName) prefixes.push(attributeName);
    const fullPrefix = prefixes.join('.');

    const formattedPropEntries = Object.entries(attributeMapping).map(
      ([key, value]) => [`avocet.${fullPrefix}.${key}`, String(value)],
    );

    return Object.fromEntries(formattedPropEntries);
  }

  protected static formatFlagAttributes(
    flagName: string,
    flag: ClientSDKFlagValue,
  ): Record<string, string> {
    return AvocetSDKBase.toFlatAttributes('feature-flag', flagName, flag);
  }

  protected static formatClientProps(
    clientProps: ClientPropMapping,
  ): Record<string, string> {
    return AvocetSDKBase.toFlatAttributes('client-prop', null, clientProps);
  }

  protected async fetchFrom(path: string, body: object) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(`${this.apiUrl}/${path}`, fetchOptions);
    if (!response.ok) {
      return response;
    }

    const data = await response.json();
    return {
      ...response,
      ok: true,
      body: data,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  protected async fetchAllFlags() {
    return true;
  }

  /**
   * Retrieve a copy of cached data for the specified flag
   */
  protected getCachedFlagData(flagName: string): unknown {
    return this.flagCache[flagName];
  }
}
