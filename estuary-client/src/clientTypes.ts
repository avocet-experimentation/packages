import { ClientPropMapping } from '@estuary/types';

export type ClientOptions = {
  environmentName: string; // placeholder until API keys are implemented
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: Record<string, string>
  ) => void;
  apiUrl: string;
  clientProps: ClientPropMapping;
};
