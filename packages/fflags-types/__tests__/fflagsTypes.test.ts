import { beforeAll, describe, expect, test } from "vitest";
import { FeatureFlagContent, FeatureFlags, FlagName } from "../src/index.js";

describe("fflagsTypes", () => {
  let flags: FeatureFlags;

  const mockBooleanFFContent = (
    flagName: string,
    enabled: boolean
  ): FeatureFlagContent => ({
    name: flagName,
    description: "This is a test!",
    enabled: enabled,
    status: "in_test",
    createdAt: Number(new Date().toISOString),
    environments: { dev: false, prod: false, testing: true },
    valueType: "number",
    defaultValue: 200,
  });

  const mockFeatureFlags = (): FeatureFlags => {
    const flags: FeatureFlags = new Map<FlagName, FeatureFlagContent>();
    flags.set("flagOne", mockBooleanFFContent("flagOne", false));
    flags.set("flagTwo", mockBooleanFFContent("flagTwo", true));
    return flags;
  };

  const getFlag = (flagName: FlagName): FeatureFlagContent | undefined => {
    const flagContent = flags.get(flagName);
    return flagContent ? flagContent : undefined;
  };

  beforeAll(() => {
    flags = mockFeatureFlags();
  });

  test("Should retrieve an existing flag from the cached data", () => {
    const actualOne = getFlag("flagOne");
    const actualTwo = getFlag("flagTwo");
    expect(actualOne?.enabled).eql(false);
    expect(actualTwo?.enabled).eql(true);
  });

  test("Should fail to retrieve a non-existing flag from the cached data", () => {
    const undefinedFlag = getFlag("flag");
    expect(undefinedFlag).undefined;
  });
});
