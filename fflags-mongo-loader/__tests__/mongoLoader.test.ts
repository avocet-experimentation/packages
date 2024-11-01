import { describe, expect, test } from "vitest";
import { mockedFeatureFlagsInDB } from "./featureFlags.mock";
import { FeatureFlagsInDB, FlagContentInDB } from "../src/featureFlagModel.js";
import { MongoDBLoader } from "../src";
import { useMockDB } from "./useMockedDB.mock";
import { FlagEnvironment } from "@fflags/types";

describe("MongoDBLoader (retrieve data from mocked environment)", async () => {
  useMockDB();

  /*
    each test will load the flags using the given environment and test the loaded content with the mocked data
  */

  const runGroupTest = (
    actualGroups: FlagContentInDB,
    expectedGroups: FlagEnvironment
  ) => {
    expect(actualGroups).toBeDefined();
    expect(actualGroups.environments).toBeDefined();
    expect(actualGroups.environments.enabled).eq(expectedGroups.enabled);
    expect(actualGroups.newFeatureAccess.value).eql(
      expectedGroups.newFeatureAccess.value
    );
    expect(actualGroups.oldFeatureAccess).toBeDefined();
    expect(actualGroups.oldFeatureAccess.enabled).eq(
      expectedGroups.oldFeatureAccess.enabled
    );
    expect(actualGroups.oldFeatureAccess.value).eql(
      expectedGroups.oldFeatureAccess.value
    );
  };

  test("Should load correctly from production", async () => {
    const flags: FeatureFlagsInDB = await MongoDBLoader.load("prod");
    console.log(flags);
    expect(flags.size).eq(2);
    runGroupTest(
      flags.get("flagOne"),
      mockedFeatureFlagsInDB[0].environments.prod
    );
    runGroupTest(
      flags.get("flagTwo"),
      mockedFeatureFlagsInDB[1].environments.prod
    );
  });

  test("Should load correctly from staging", async () => {
    const flags: FeatureFlagsInDB = await MongoDBLoader.load("testing");
    console.log(flags);
    expect(flags.size).eq(2);
    runGroupTest(
      flags.get("flagWithStateOne"),
      mockedFeatureFlagsInDB[2].environments.testing.userGroups
    );
    runGroupTest(
      flags.get("flagWithStateTwo"),
      mockedFeatureFlagsInDB[3].environments.testing.userGroups
    );
  });
});
