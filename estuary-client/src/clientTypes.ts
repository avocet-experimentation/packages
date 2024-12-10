import { ClientPropMapping } from '@estuary/types';

export type ClientOptions = {
  environmentName: string; // placeholder until API keys are implemented
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: (
    attributes: Record<string, string>,
    ...args: unknown[]
  ) => void;
  attributePrefix: string;
  apiUrl: string;
  clientProps: ClientPropMapping;
};

const attributeCategoryPrefixes = ['feature-flag', 'client-prop'] as const;
export type AttributeCategoryPrefix =
  (typeof attributeCategoryPrefixes)[number];
