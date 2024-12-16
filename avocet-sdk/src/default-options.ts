import { AvocetSDKOptions } from './sdk-types.js';

export const DEFAULT_OPTIONS: Required<
Pick<
AvocetSDKOptions,
'autoRefresh' | 'autoRefreshInterval' | 'discardStaleFlags'
>
> = {
  autoRefresh: true,
  autoRefreshInterval: 5 * 60,
  discardStaleFlags: false,
};
