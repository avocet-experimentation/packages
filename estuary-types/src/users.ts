import { z } from 'zod';
/*
  Dashboard user account types.
  These are placeholders, so likely to be revised
*/

export const permissionLevelSchema = z.enum(['none', 'view', 'edit', 'admin']);

export const userPermissionsSchema = z.object({
  fflags: permissionLevelSchema,
  experiments: permissionLevelSchema,
  environments: permissionLevelSchema,
  users: permissionLevelSchema,
  attributes: permissionLevelSchema,
  events: permissionLevelSchema,
})

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  permissions: userPermissionsSchema,
});

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;

export type UserPermissions = z.infer<typeof userPermissionsSchema>;

export type User = z.infer<typeof userSchema>;
