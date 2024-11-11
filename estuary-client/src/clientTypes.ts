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
  key: FlagName;
  providerName: "estuary-exp";
  value: FlagCurrentValue;
  hash: number;
}

export interface ExperimentAttributes {
  key: string;
  providerName: "estuary-exp";
  blockId: string;
}

export type ClientOptions = {
  environment: EnvironmentName;
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: FlagAttributes,
  ) => void;
  apiUrl: string;
  attributes: ClientPropMapping;
};
