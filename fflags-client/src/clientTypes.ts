import { FeatureFlag, FeatureFlagClientData, FlagEnvironmentName, FlagName } from "@fflags/types"

/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes {
  key: FlagName;
  providerName: 'Field-Trip';
  valueType: FeatureFlag['valueType'];
  value: string;
}

export interface ExperimentAttributes {
  key: string;
  providerName: 'Field-Trip';
  blockId: string;
}


export type Attributes = { featureFlags?: FlagAttributes[], experiments: ExperimentAttributes[] } 
| { featureFlags: FlagAttributes[], experiments?: ExperimentAttributes[] }

export type ClientFlagMapping = Record<FlagName, FeatureFlagClientData>;

export type ClientOptions = {
  environment: FlagEnvironmentName;
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  // autoAddSpanAttributes: boolean;
  attributeAssignmentCb?: <SpanType>(span: SpanType) => void;
  apiUrl: string;
};