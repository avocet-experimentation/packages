import { z } from 'zod';
import { oTelAttributeValueSchema } from './attributes.js';
import { nonNegativeIntegerSchema } from './helpers/util.js';

/* TYPES FOR TRANSFORMED EVENTS AND DASHBOARD-DEFINED METRICS */

export const cqlDateSchema = z.number().int();  // placeholder until we figure out how dates are actually stored. See https://cassandra.apache.org/doc/stable/cassandra/cql/types.html#dates

export const oTelEventSchema = z.object({
  timestamp: cqlDateSchema,
  name: z.string(),
  attributes: z.record(z.string(), z.string()),
});

export interface OtelEvent extends z.infer<typeof oTelEventSchema> {};

export const oTelLinkSchema = z.object({
  traceid: z.string(),
  spanid: z.string(),
  tracestate: z.string(),
  attributes: z.record(z.string(), z.string()),
});

export interface OTelLink extends z.infer<typeof oTelLinkSchema> {};

export const spanCoreSchema = z.object({
  duration: nonNegativeIntegerSchema,
  events: z.array(oTelEventSchema),
  spanname: z.string(),
  timestamp: cqlDateSchema,
  spanattributes: z.record(z.string(), z.string()),
});

export interface SpanCore extends z.infer<typeof spanCoreSchema> {};

/**
 * Use these to define dependent variables on Experiments
 * For now, these are embedded into Experiments
 */
export const metricSchema = z.object({
  fieldName: z.string(),
  fieldDataType: oTelAttributeValueSchema,
});

export interface Metric extends z.infer<typeof metricSchema> {};