import { ClientPropMapping, ClientSDKFlagValue } from '@avocet/core';
import { Options } from 'quick-lru';

export type ClientOptions = {
  apiKey: string;
  apiUrl: string;
  autoRefresh: boolean;
  attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;
  /** set `maxSize` greater than or equal to the number of flags on the environment */
  cacheOptions: Options<string, ClientSDKFlagValue>;
  clientProps: ClientPropMapping;
  refreshIntervalInSeconds?: number;
  /** Whether to keep or discard flag values when fetching. Default `true` */
  useStale?: boolean;
};

const attributeCategoryPrefixes = ['feature-flag', 'client-prop'] as const;
export type AttributeCategoryPrefix =
  (typeof attributeCategoryPrefixes)[number];
