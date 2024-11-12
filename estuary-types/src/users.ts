import { z } from 'zod';
/*
  Dashboard user account types.
  These are placeholders, so likely to be revised
*/

export const permissionLevelSchema = z.enum(['none', 'view', 'edit', 'full']);

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;

export const userPermissionsSchema = z.object({
  flags: permissionLevelSchema,
  experiments: permissionLevelSchema,
  environments: permissionLevelSchema,
  users: permissionLevelSchema,
  clientProps: permissionLevelSchema,
  clientConnections: permissionLevelSchema,
  events: permissionLevelSchema,
})

export type UserPermissions = z.infer<typeof userPermissionsSchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  permissions: userPermissionsSchema,
});
/**
 * (Tentative) Dashboard user account data. * 
 */
export type User = z.infer<typeof userSchema>;
