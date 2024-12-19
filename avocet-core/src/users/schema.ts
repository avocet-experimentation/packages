import { z } from 'zod';
import { avocetMongoCollectionNameSchema } from '../helpers/names.js';
/*
  Dashboard user account types.
  These are placeholders, likely to be revised once
  authentication is implemented
*/

export const permissionLevelSchema = z.enum(['none', 'view', 'edit', 'full']);

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;

export const userPermissionsSchema = z
  .record(avocetMongoCollectionNameSchema, permissionLevelSchema)
  .refine((obj): obj is Required<typeof obj> =>
    avocetMongoCollectionNameSchema.options.every((key) => key in obj));

export const userDraftSchema = z.object({
  // name: z.string(),
  identifier: z.string(),
  // passwordHash: z.string(), // todo: clecan up once deciding on user auth system
  permissions: userPermissionsSchema,
});
