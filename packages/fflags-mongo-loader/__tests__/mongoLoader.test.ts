import { describe, expect, test } from "vitest";
import { mockedFeatureFlagsInDB } from "./featureFlags.mock";
import { FeatureFlags, UserGroups } from "@fflags/types";
import { MongoDBLoader } from "../src";
import { useMockDB } from "./useMockedDB.mock";

describe("MongoDBLoader (retrieve data from mocked environment)", async () => {
  useMockDB();

  /*
    each test will load the flags using the given environment and test the loaded content with the mocked data
  */

  const runGroupTest = (
    actualGroups: UserGroups,
    expectedGroups: UserGroups
  ) => {
    expect(actualGroups).toBeDefined();
    expect(actualGroups.newFeatureAccess).toBeDefined();
    expect(actualGroups.newFeatureAccess.enabled).eq(
      expectedGroups.newFeatureAccess.enabled
    );
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
    const flags: FeatureFlags = await MongoDBLoader.load("production");
    expect(flags.size).eq(2);
    runGroupTest(
      flags.get("flagOne"),
      mockedFeatureFlagsInDB[0].environments.production.userGroups
    );
    runGroupTest(
      flags.get("flagTwo"),
      mockedFeatureFlagsInDB[1].environments.production.userGroups
    );
  });

  test("Should load correctly from staging", async () => {
    const flags: FeatureFlags = await MongoDBLoader.load("staging");
    expect(flags.size).eq(2);
    runGroupTest(
      flags.get("flagOne"),
      mockedFeatureFlagsInDB[0].environments.staging.userGroups
    );
    runGroupTest(
      flags.get("flagTwo"),
      mockedFeatureFlagsInDB[1].environments.staging.userGroups
    );
  });
});
