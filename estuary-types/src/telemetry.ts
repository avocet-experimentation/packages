import { z } from 'zod';

/* TYPES FOR RAW OPENTELEMETRY DATA */

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

export const transformedSpanSchema = spanSchema
  .omit({ attributes: true })
  .extend({
    parentScope: scopeSchema,
    attributes: z.array(spanTransformedAttributeSchema),
  });

export interface TransformedSpan
  extends z.infer<typeof transformedSpanSchema> {}

// spans, traces, etc
export const eventTelemetrySchema = transformedSpanSchema; // or potentially more

export interface EventTelemetry extends z.infer<typeof eventTelemetrySchema> {}
