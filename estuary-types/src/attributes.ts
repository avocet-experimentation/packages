import { z } from "zod";

// export const clientAttributeDataSchema = z.enum([
//   "string",
//   "number",
//   "boolean",
// ]);

// export const clientSessionAttributeSchema = z.object({
//   name: z.string(), // might remove this
//   dataType: clientAttributeDataSchema,
//   value: z.string(),
// });

export const clientSessionAttributeValue = z.union([z.boolean(), z.string(), z.number()]);
/**
 * Mapping of attribute names to their values
 */
export const clientSessionAttributeMappingSchema = z.record(z.string(), clientSessionAttributeValue);

// export type ClientAttributeData = z.infer<typeof clientAttributeDataSchema>;

/**
 * Keys of the attributes passed into the client SDK when initialized and used for experiment/flag assignment
 * dataType is used to type-coerce attribute values
 */
// export type ClientSessionAttribute = z.infer<typeof clientSessionAttributeSchema>;

export type ClientSessionAttributeMapping = z.infer<typeof clientSessionAttributeMappingSchema>;