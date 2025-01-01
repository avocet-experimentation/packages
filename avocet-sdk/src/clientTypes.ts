import { ClientPropMapping } from '@avocet/core';

export type ClientOptions = {
  apiUrl: string;
  apiKey: string;
  autoRefresh: boolean;
  clientProps: ClientPropMapping;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;
};

const attributeCategoryPrefixes = ['feature-flag', 'client-prop'] as const;
export type AttributeCategoryPrefix =
  (typeof attributeCategoryPrefixes)[number];
