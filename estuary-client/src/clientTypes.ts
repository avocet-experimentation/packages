import {
  EnvironmentName,
  FlagName,
  ClientPropMapping,
  FlagCurrentValue,
} from "@estuary/types";

/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes {
  [key: FlagName]:  {
    value: FlagCurrentValue;
    hash: number;
  }
}

export type FlagAttributeMapping = {
  'estuary-exp': FlagAttributes
}

// export interface ExperimentAttributes {
//   key: string;
//   providerName: "estuary-exp";
//   blockId: string;
// }

export type ClientOptions = {
  environment: EnvironmentName;
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: FlagAttributeMapping,
  ) => void;
  apiUrl: string;
  attributes: ClientPropMapping;
};
