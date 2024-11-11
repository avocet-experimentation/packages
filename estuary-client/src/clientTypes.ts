import {
  ClientSessionAttribute,
  FeatureFlag,
  EnvironmentName,
  FlagName,
} from "@estuary/types";

/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes {
  key: FlagName;
  providerName: "estuary-exp";
  value: FeatureFlag["value"];
}

export interface ExperimentAttributes {
  key: string;
  providerName: "estuary-exp";
  blockId: string;
}

export type Attributes =
  | { featureFlags?: FlagAttributes[]; experiments: ExperimentAttributes[] }
  | { featureFlags: FlagAttributes[]; experiments?: ExperimentAttributes[] };

export type ClientOptions = {
  environment: EnvironmentName;
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  attributeAssignmentCb?: <SpanType>(
    span: SpanType,
    attributes: Attributes
  ) => void;
  apiUrl: string;
  clientSessionAttributes: ClientSessionAttribute[];
};
