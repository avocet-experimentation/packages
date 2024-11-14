import { z } from 'zod';
import { estuaryBaseSchema, objectIdHexStringSchema } from './util.js';
import { estuaryMongoCollectionNameSchema } from './general.js';
/*
  Dashboard user account types.
  These are placeholders, likely to be revised once 
  authentication is implemented
*/

export const permissionLevelSchema = z.enum(['none', 'view', 'edit', 'full']);

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;

export const userPermissionsSchema = z.record(estuaryMongoCollectionNameSchema, permissionLevelSchema);

export interface UserPermissions extends z.infer<typeof userPermissionsSchema> {};

export const userSchema = estuaryBaseSchema.extend({
  id: objectIdHexStringSchema,
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  permissions: userPermissionsSchema,
});
/**
 * (Tentative) Dashboard user account data.
 */
export interface User extends z.infer<typeof userSchema> {};
