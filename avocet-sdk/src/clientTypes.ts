import { ClientPropMapping } from '@avocet/core';

export type ClientOptions = {
  apiKey: string;
  apiUrl: string;
  autoRefresh: boolean;
  attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;
  clientProps: ClientPropMapping;
  refreshIntervalInSeconds?: number;
  /** Whether to keep or discard flag values when fetching. Default `true` */
  useStale?: boolean;
};

const attributeCategoryPrefixes = ['feature-flag', 'client-prop'] as const;
export type AttributeCategoryPrefix =
  (typeof attributeCategoryPrefixes)[number];
