import { z } from "zod";
import { estuaryBaseSchema, flagCurrentValueSchema } from "./util.js";
import { flagNameSchema } from "./featureFlags.js";

/**
 * For client app connections to the cattails feature flagging service
 */
const clientConnectionSchema = estuaryBaseSchema.extend({
  environmentId: z.string(),
  // clientKeyHash: z.string(), // TBD
});

export type ClientConnection = z.infer<typeof clientConnectionSchema>;
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

export const flagClientValueSchema = z.object({
  value: flagCurrentValueSchema,
  hash: z.number(), // override rule hash
});
/**
 * The response sent to the client when checking the value of a flag
 */
export type FlagClientValue = z.infer<typeof flagClientValueSchema>;

export const flagClientMappingSchema = z.record(
  flagNameSchema,
  flagClientValueSchema
);
/**
 * Mapping of flag names to their client-side data
 */
export type FlagClientMapping = z.infer<typeof flagClientMappingSchema>;
