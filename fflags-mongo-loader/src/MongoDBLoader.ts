import { FlagEnvironmentName, FlagName } from "@fflags/types";
import {
  FeatureFlagsInDB,
  FFlagModel,
  FlagContentInDB,
} from "./featureFlagModel.js";

// use only static methods because we do not need to create an object
// class acts more as a namespace
export class MongoDBLoader {
  /**
   *  description
   * @param envName Environment name
   * @param flagStatus
   * @returns
   *
   */
  static async load(envName: FlagEnvironmentName): Promise<FeatureFlagsInDB> {
    // TODO: ensure valid parameter
    const filter = {
      [`environments.${envName}`]: { $exists: true },
    };
    const projection = `name valueType defaultValue environments.${envName}`;
    const flagsInDB = await FFlagModel.find(filter, projection).exec(); // exec returns a real promise
    const cachedFlags: FeatureFlagsInDB = new Map<FlagName, FlagContentInDB>(); // TODO: change value type of Map
    // map hashmap returned to our record
    // Note: we could have use Map for the groups in memory as well and avoid this conversion => possibly look into this
    for (const flag of flagsInDB) {
      const environment = flag.environments.get(envName);
      if (!environment) continue;
      cachedFlags.set(flag.name, flag);
    }
    return cachedFlags;
  }

  // private static toRecord(groupsIn: Map<UserGroupName, FeatureFlagContent>) {
  //   let groupsOut: Record<UserGroupName, FeatureFlagContent> = {};
  //   for (const [userGroupName, flagContent] of groupsIn) {
  //     groupsOut[userGroupName] = flagContent;
  //   }
  //   return groupsOut;
  // }
}

/*

  TODO:
    - Client needs to fetch all flags when they load the app (filter by environments)

*/
