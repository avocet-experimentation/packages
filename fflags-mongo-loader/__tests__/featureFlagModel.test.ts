import { describe, expect, test } from "vitest";
import { FFlagModel } from "../src";
import { mockedFeatureFlagsInDB } from "./featureFlags.mock";
import { useMockDB } from "./useMockedDB.mock";

// Check successful model changes
describe("FeatureFlagModel", async () => {
  useMockDB();

  // Create a new flag in the DB, and check if the transformation works as expected
  test("toJSON()", async () => {
    const flagToSave = mockedFeatureFlagsInDB[0];
    flagToSave.name = "flagThree";
    const newFFlag = (await FFlagModel.create(flagToSave)).toJSON();
    expect(newFFlag.id).toBeDefined();
    expect(newFFlag.name).eq("flagThree");
    expect(newFFlag.environments).eql(flagToSave.environments);
    expect(newFFlag.createdAt).toBeDefined();
    expect(newFFlag.updatedAt).toBeDefined();
  });
});
