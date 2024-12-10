/**
 * (WIP) telemetry data structure expected by dashboard.
 * Based on OpenTelemetry's span structure, with transformations
 * to enable CQL searches by attribute name
 */
export interface TransformedSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name: string;
  kind: number;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Record<string, { type: string; value: string }>;
}
