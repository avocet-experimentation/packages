import { z } from "zod";

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

export const spanAttributeSchema = z.union([
  spanArrayAttributeSchema,
  spanStringAttributeSchema,
  spanIntAttributeSchema,
]);

export const spanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string(),
  name: z.string(),
  kind: z.number(),
  startTimeUnixNano: z.string(),
  endTimeUnixNano: z.string(),
  attributes: z.array(spanAttributeSchema),
  status: z.object({}), // placeholder
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

export const eventTelemetrySchema = transformedSpanSchema;
