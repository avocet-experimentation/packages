import {
  EnvironmentName,
  FeatureFlagContent,
  FeatureFlags,
  FlagName,
  UserGroupName,
  UserGroups,
  StateName,
} from "@fflags/types";
import { FFlagModel } from "./featureFlagModel.js";

// use only static methods because we do not need to create an object
// class acts more as a namespace
export class MongoDBLoader {
  static async load(
    environmentName: EnvironmentName,
    stateName: StateName = "in_test"
  ): Promise<FeatureFlags> {
    const filter = {
      [`environments.${environmentName}`]: { $exists: true },
      state: stateName,
    };
    const projection = `name environments.${environmentName}`;
    const flagsInDB = await FFlagModel.find(filter, projection).exec(); // exec returns a real promise
    const cachedFlags: FeatureFlags = new Map<FlagName, UserGroups>();
    // map hashmap returned to our record
    // Note: we could have use Map for the groups in memory as well and avoid this conversion => possibly look into this
    for (const flagInDB of flagsInDB) {
      const environment = flagInDB.environments.get(environmentName);
      const userGroupsInDB = environment?.userGroups;
      if (!userGroupsInDB) continue;
      cachedFlags.set(flagInDB.name, this.toRecord(userGroupsInDB));
    }
    return cachedFlags;
  }

  private static toRecord(groupsIn: Map<UserGroupName, FeatureFlagContent>) {
    let groupsOut: Record<UserGroupName, FeatureFlagContent> = {};
    for (const [userGroupName, flagContent] of groupsIn) {
      groupsOut[userGroupName] = flagContent;
    }
    return groupsOut;
  }
}
