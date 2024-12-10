import { PrimitiveTypeLabel } from '../helpers/bounded-primitives.js';
import { TextPrimitive } from './otel/attributes.js';

export type TransformedSpanAttributes = {
  [key: string]: { type: PrimitiveTypeLabel; value: string };
};
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
  attributes: TransformedSpanAttributes;
}

export type CoercedSpanAttributes = { [x: string]: TextPrimitive };
