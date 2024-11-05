import { z } from "zod";
import { overrideRuleSchema } from "./overrideRules.schema.js";

export const flagNameSchema = z.string();

export const environmentNameSchema = z.enum(['prod', 'dev', 'testing', 'staging']);

export const flagEnvironmentSchema = z.object({
  name: flagNameSchema,
  enabled: z.boolean(),
  overrideRules: z.array(overrideRuleSchema),
});

export const flagEnvironmentsSchema = z.record(environmentNameSchema, flagEnvironmentSchema)
  .refine((data): data is Required<typeof data> => {
      return environmentNameSchema.options.every((key) => key in data);
    }, 
    { message: "All environment keys must be defined", }
  );

export const featureFlagSchema = z.object({
  id: z.string(),
  name: flagNameSchema,
  description: z.string().optional(),
  createdAt: z.number().int().gte(0).optional(),
  updatedAt: z.number().int().gte(0).optional(),
  environments: flagEnvironmentsSchema,
  valueType: z.enum([
    "boolean",
    "string",
    "number",
  ]),
  defaultValue: z.string(),
});

export const featureFlagsSchema = z.record(flagNameSchema, featureFlagSchema);

export const featureFlagClientDataSchema = featureFlagSchema
  .pick({ name: true, valueType: true, defaultValue: true })
  .and(
    z.object({
      currentValue: z.string(),
    }),
  );


export const clientFlagMappingSchema = z.record(flagNameSchema, featureFlagClientDataSchema);
