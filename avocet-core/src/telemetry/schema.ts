import { z } from 'zod';
import {
  PrimitiveTypeLabel,
  primitiveTypeLabelSchema,
} from '../helpers/bounded-primitives.js';
import { TextPrimitive } from './otel/attributes.js';

export type TransformedSpanAttributes = {
  [key: string]: { type: PrimitiveTypeLabel; value: string };
};

export const transformedSpanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().nullable(),
  name: z.string(),
  kind: z.number(),
  startTimeUnixNano: z.string(),
  endTimeUnixNano: z.string(),
  attributes: z.record(
    z.string(),
    z.object({ type: primitiveTypeLabelSchema, value: z.string() }),
  ),
});

/**
 * Telemetry data structure expected by dashboard.
 * Based on OpenTelemetry's span structure, with transformations
 * to enable CQL searches by attribute name
 */
export class TransformedSpan implements z.infer<typeof transformedSpanSchema> {
  traceId: string;

  spanId: string;

  parentSpanId: string;

  name: string;

  kind: number;

  startTimeUnixNano: string;

  endTimeUnixNano: string;

  attributes: TransformedSpanAttributes;

  constructor(arg: TransformedSpan) {
    this.traceId = arg.traceId;
    this.spanId = arg.spanId;
    this.parentSpanId = arg.parentSpanId;
    this.name = arg.name;
    this.kind = arg.kind;
    this.startTimeUnixNano = arg.startTimeUnixNano;
    this.endTimeUnixNano = arg.endTimeUnixNano;
    this.attributes = arg.attributes;
  }
}

export type CoercedSpanAttributes = { [x: string]: TextPrimitive };
