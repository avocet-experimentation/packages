import { z } from "zod";
import { PermissionLevel, userDraftSchema, userPermissionsSchema } from "./schema.js";
import { EstuaryMongoCollectionName } from "../helpers/names.js";
import { RequireOnly } from "../helpers/utility-types.js";

export class UserPermissions implements z.infer<typeof userPermissionsSchema> {
  featureFlag: PermissionLevel;
  experiment: PermissionLevel;
  clientPropDef: PermissionLevel;
  clientConnection: PermissionLevel;
  environment: PermissionLevel;
  user: PermissionLevel;

  constructor(permissions: UserPermissions) {
    this.featureFlag = permissions.featureFlag;
    this.experiment = permissions.experiment;
    this.clientPropDef = permissions.clientPropDef;
    this.clientConnection = permissions.clientConnection;
    this.environment = permissions.environment;
    this.user = permissions.user;
  }

  /**
   * Create a permissions object with the specified permission level on all collections
   */
  static templateLevel(level: PermissionLevel) {
    return new UserPermissions({
      featureFlag: level,
      experiment: level,
      clientPropDef: level,
      clientConnection: level,
      environment: level,
      user: level,
    })
  }

  /**
   * Create a permissions object with all permissions to all collections
   */
  static templateFull(partialPermissions?: Partial<UserPermissions>) {
    const defaults = this.templateLevel('full');

    return new UserPermissions({ ...defaults, ...partialPermissions });
  }
}

export class UserDraft implements z.infer<typeof userDraftSchema> {
  email: string;
  permissions: UserPermissions;

  constructor(draft: UserDraft) {
    this.email = draft.email;
    this.permissions = draft.permissions;
  }

  static templateAdmin(partial: RequireOnly<UserDraft, 'email'>) {
    const defaults = {
      permissions: UserPermissions.templateFull(),
    }

    return new UserDraft({ ...defaults, ...partial });
  }
}