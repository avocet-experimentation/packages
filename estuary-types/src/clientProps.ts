import { z } from "zod";
import { estuaryBaseSchema } from "./general.js";
/**
 * Keys of the attributes passed into the client SDK when initialized and used for experiment/flag assignment
 */
export const clientPropNameSchema = z.string();

export const clientPropValueSchema = z.union([z.boolean(), z.string(), z.number()]);
/**
 * Mapping of client property names to their values
 */
export const clientPropMappingSchema = z.record(clientPropNameSchema, clientPropValueSchema);

// if we want to support different properties for each kind of data type,
// such as string formatting
// export const clientPropValueDefSchema = z.union([
//   clientPropBooleanValueSchema,
//   clientPropStringValueSchema,
//   clientPropBooleanValueSchema,
// ])

export const clientPropDefSchema = estuaryBaseSchema.extend({
  dataType: clientPropValueSchema,
  isIdentifier: z.boolean(),
});
/**
 * Definition of a client property visible server-side
 */
export type ClientPropDef = z.infer<typeof clientPropDefSchema>;
/**
 * prop name-value mapping sent by the client SDK when establishing a connection
 */
export type ClientPropMapping = z.infer<typeof clientPropMappingSchema>;