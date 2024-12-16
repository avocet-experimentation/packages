import { ClientPropMapping } from '@avocet/core';

export type AttributeCategoryPrefix = 'feature-flag' | 'client-prop';

export interface AvocetSDKOptions {
  /** URL of the feature flagging API */
  apiUrl: string;
  // apiKey: string; // to replace .environmentName
  environmentName: string; // todo: replace once API keys are implemented
  /** If set `true`, previously cached flag values will be
   * discarded when attempting to fetch. Defaults to `false` */
  discardStaleFlags?: boolean;
  /** Set whether or not to intermittently fetch new values. Defaults to `true`. */
  autoRefresh?: boolean;
  /** The latency in seconds between automatic flag fetches. Defaults to `300`. */
  autoRefreshInterval?: number;
  /** Defines how to store flag data on telemetry data. */
  attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;
}

export interface AvocetClientOptions extends AvocetSDKOptions {
  /** Dictionary of client properties. Set this to `null` if serving multiple
   * clients from one instance
   */
  clientProps: ClientPropMapping;
}

export interface AvocetServerOptions extends AvocetSDKOptions {}
