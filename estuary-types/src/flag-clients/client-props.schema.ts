import { z } from "zod";
import { nonEmptyStringSchema } from "../helpers/bounded-primitives.js";

/**
 * Keys of the attributes passed into the client SDK when initialized and used for experiment/flag assignment
 */
export const clientPropNameSchema = z.string().min(1);

export const clientPropValueSchema = z.enum(['boolean', 'string', 'number']);
export type ClientPropValue = z.infer<typeof clientPropValueSchema>;
/**
 * Mapping of client property names to their values
 */
export const clientPropMappingSchema = z.record(clientPropNameSchema, clientPropValueSchema);
/**
 * prop name-value mapping sent by the client SDK when establishing a connection
 */
export interface ClientPropMapping extends z.infer<typeof clientPropMappingSchema> {};

export const clientPropDefDraftSchema = z.object({
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  dataType: clientPropValueSchema,
  isIdentifier: z.boolean(),
});
/**
 * Definition of a client property visible server-side
 */
export interface ClientPropDefDraft extends z.infer<typeof clientPropDefDraftSchema> {};