import {
  EnvironmentName,
  ClientPropMapping,
  FlagAttributes,
  FlagClientValue,
} from "@estuary/types";

export type ClientOptions = {
  environment: EnvironmentName; // placeholder until API keys are implemented
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: Record<string, string>,
  ) => void;
  apiUrl: string;
  clientProps: ClientPropMapping;
};

// // is this needed?
// export {
//   ClientPropMapping,
//   FlagAttributes,
//   FlagClientValue,
// }