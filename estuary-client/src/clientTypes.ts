import {
  EnvironmentName,
  ClientPropMapping,
  FlagCurrentValue,
} from "@estuary/types";

/**
 * For embedding in telemetry data. See https://opentelemetry.io/docs/specs/semconv/feature-flags/feature-flags-spans/
 * and https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
 */
export interface FlagAttributes {
  'feature_flag.key': string;
  'feature_flag.provider_name': 'estuary-exp';
  'feature_flag.variant': FlagCurrentValue;
  'feature_flag.hash': number | string; // todo: narrow down
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
  clientProps: ClientPropMapping;
};
