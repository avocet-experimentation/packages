import { z } from "zod";

// seems to be metadata (details of the instrumentation package)
export const scopeSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export const spanStringAttributeSchema = z.object({
  key: z.string(),
  value: z.object({
    stringValue: z.string(),
  }),
});

export const spanIntAttributeSchema = z.object({
  key: z.string(),
  value: z.object({
    intValue: z.string(),
  }),
});

// export const spanPrimitiveAttributeSchema = z.union([
//   spanStringAttributeSchema,
//   spanIntAttributeSchema,
// ]);

export const spanArrayAttributeSchema = z.union([
  z.array(spanStringAttributeSchema),
  z.array(spanIntAttributeSchema),
]);

// context for a span, such as the route followed, current configuration, etc
// Used to store flag and experiment data
export const spanAttributeSchema = z.union([
  spanArrayAttributeSchema,
  spanStringAttributeSchema,
  spanIntAttributeSchema,
]);

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

export const scopeSpanSchema = z.object({
  scope: scopeSchema,
  spans: z.array(spanSchema),
});

export const resourceSpanSchema = z.object({
  resource: z.object({
    attributes: z.array(spanAttributeSchema),
  }),
  scopeSpans: z.array(scopeSpanSchema),
});

export const spanTransformedAttributeSchema = z.object({
  key: z.string(),
  type: z.string(),
  value: z.string(),
});

export const transformedSpanSchema = spanSchema
  .omit({ attributes: true })
  .extend({
    parentScope: scopeSchema,
    attributes: z.array(spanTransformedAttributeSchema),
  });

// spans, traces, etc
export const eventTelemetrySchema = transformedSpanSchema; // or potentially more

export type Scope = z.infer<typeof scopeSchema>;

export type SpanStringAttribute = z.infer<typeof spanStringAttributeSchema>;

export interface SpanIntAttribute {
  key: string; // e.g., http.route
  value: {
	  intValue: string; // e.g., '/'
  }
}

// export type SpanPrimitiveAttribute = SpanStringAttribute | SpanIntAttribute;

export type SpanArrayAttribute = z.infer<typeof spanArrayAttributeSchema>;

export type SpanAttribute = z.infer<typeof spanAttributeSchema>;

export type Span = z.infer<typeof spanSchema>; 

export type ScopeSpan = z.infer<typeof scopeSpanSchema>;

export type ResourceSpan = z.infer<typeof resourceSpanSchema>;

export type SpanTransformedAttribute = z.infer<typeof spanTransformedAttributeSchema>;

export type TransformedSpan = z.infer<typeof transformedSpanSchema>;

export type EventTelemetry = z.infer<typeof eventTelemetrySchema>;