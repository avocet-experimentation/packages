import { z } from 'zod';
import { nonEmptyStringSchema } from '../helpers/bounded-primitives.js';

/**
 * Keys of the attributes passed into the client SDK when initialized and used
 * for experiment/flag assignment
 */
export const clientPropNameSchema = z.string().min(1);

export const clientPropValueSchema = z.union([
  z.boolean(),
  z.string(),
  z.number(),
]);

export type ClientPropValue = z.infer<typeof clientPropValueSchema>;
/**
 * Mapping of client property names to their values
 */
export const clientPropMappingSchema = z.record(
  clientPropNameSchema,
  clientPropValueSchema,
);
/**
 * prop name-value mapping sent by the client SDK when establishing a connection
 */
export interface ClientPropMapping
  extends z.infer<typeof clientPropMappingSchema> {}

export const clientPropEntriesSchema = z.array(
  z.tuple([clientPropNameSchema, clientPropValueSchema]),
);
export type ClientPropEntries = z.infer<typeof clientPropEntriesSchema>;

export const clientPropDefDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().nullable(),
  dataType: clientPropValueSchema,
  isIdentifier: z.boolean(),
});
