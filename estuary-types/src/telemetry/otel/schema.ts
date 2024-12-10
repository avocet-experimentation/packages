import { z } from 'zod';
import { nonNegativeIntegerSchema } from '../../helpers/bounded-primitives.js';

/* TYPES FOR TRANSFORMED EVENTS AND DASHBOARD-DEFINED METRICS */

// todo: decide if these are still needed, and remove if not

/**
 * Similar to Unix timestamps, except permitting negative numbers to denote
 * dates before 1970.
 * See https://cassandra.apache.org/doc/stable/cassandra/cql/types.html#dates
 */
export const cqlDateSchema = z.number().int();

export const oTelEventSchema = z.object({
  timestamp: cqlDateSchema,
  name: z.string(),
  attributes: z.record(z.string(), z.string()),
});

export interface OtelEvent extends z.infer<typeof oTelEventSchema> {}

export const oTelLinkSchema = z.object({
  traceid: z.string(),
  spanid: z.string(),
  tracestate: z.string(),
  attributes: z.record(z.string(), z.string()),
});

export interface OTelLink extends z.infer<typeof oTelLinkSchema> {}

export const spanCoreSchema = z.object({
  duration: nonNegativeIntegerSchema,
  events: z.array(oTelEventSchema),
  spanname: z.string(),
  timestamp: cqlDateSchema,
  spanattributes: z.record(z.string(), z.string()),
});

export interface SpanCore
  extends z.infer<
    typeof spanCoreSchema
  > {} /* TYPES FOR RAW OPENTELEMETRY DATA */
// seems to be metadata (details of the instrumentation package)

export const scopeSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export interface Scope extends z.infer<typeof scopeSchema> {}

export const spanStringAttributeSchema = z.object({
  key: z.string(),
  value: z.object({
    stringValue: z.string(),
  }),
});

export interface SpanStringAttribute
  extends z.infer<typeof spanStringAttributeSchema> {}

export const spanIntAttributeSchema = z.object({
  key: z.string(),
  value: z.object({
    intValue: z.string(),
  }),
});

export interface SpanIntAttribute
  extends z.infer<typeof spanIntAttributeSchema> {}
// export const spanPrimitiveAttributeSchema = z.union([
//   spanStringAttributeSchema,
//   spanIntAttributeSchema,
// ]);
// export type SpanPrimitiveAttribute = SpanStringAttribute | SpanIntAttribute;

export const spanArrayAttributeSchema = z.union([
  z.array(spanStringAttributeSchema),
  z.array(spanIntAttributeSchema),
]);

export type SpanArrayAttribute = z.infer<typeof spanArrayAttributeSchema>;
// context for a span, such as the route followed, current configuration, etc
// Used to store flag and experiment data

export const spanAttributeSchema = z.union([
  spanArrayAttributeSchema,
  spanStringAttributeSchema,
  spanIntAttributeSchema,
]);

export type SpanAttribute = z.infer<typeof spanAttributeSchema>;
// "span" is a catch-all term for units of work or operations. See [Observability primer | OpenTelemetry](https://opentelemetry.io/docs/concepts/observability-primer/)

export const spanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string(),
  name: z.string(),
  kind: z.number(),
  startTimeUnixNano: z.string(),
  endTimeUnixNano: z.string(),
  attributes: z.array(spanAttributeSchema),
  status: z.object({}), // placeholder type
});

export interface Span extends z.infer<typeof spanSchema> {}

export const scopeSpanSchema = z.object({
  scope: scopeSchema,
  spans: z.array(spanSchema),
});

export interface ScopeSpan extends z.infer<typeof scopeSpanSchema> {}

export const resourceSpanSchema = z.object({
  resource: z.object({
    attributes: z.array(spanAttributeSchema),
  }),
  scopeSpans: z.array(scopeSpanSchema),
});

export interface ResourceSpan extends z.infer<typeof resourceSpanSchema> {}

export const spanTransformedAttributeSchema = z.object({
  key: z.string(),
  type: z.string(),
  value: z.string(),
});

export interface SpanTransformedAttribute
  extends z.infer<typeof spanTransformedAttributeSchema> {}
