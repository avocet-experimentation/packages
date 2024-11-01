import { beforeAll, describe, expect, test } from "vitest";
import { FlagContent, FeatureFlags, FlagName } from "../src/index.js";

describe("fflagsTypes", () => {
  let flags: FeatureFlags;

  const mockBooleanFFContent = (
    flagName: string,
    enabled: boolean
  ): FlagContent => ({
    id: "abc",
    name: flagName,
    description: "This is a test!",
    createdAt: Number(new Date().toISOString),
    updatedAt: Number(new Date().toISOString),
    environments: {
      dev: { enabled: enabled },
      prod: { enabled: !enabled },
      testing: { enabled: !enabled },
    },
    valueType: "number",
    defaultValue: 200,
  });

  const mockFeatureFlags = (): FeatureFlags => {
    const flags: FeatureFlags = new Map<FlagName, FlagContent>();
    flags.set("flagOne", mockBooleanFFContent("flagOne", true));
    flags.set("flagTwo", mockBooleanFFContent("flagTwo", false));
    return flags;
  };

  const getFlag = (flagName: FlagName): FlagContent | undefined => {
    const flagContent = flags.get(flagName);
    return flagContent ? flagContent : undefined;
  };

  beforeAll(() => {
    flags = mockFeatureFlags();
  });

  test("Should retrieve an existing flag from the cached data", () => {
    const actualOne = getFlag("flagOne");
    const actualTwo = getFlag("flagTwo");
    expect(actualOne?.environments.dev.enabled).eql(true);
    expect(actualTwo?.environments.dev.enabled).eql(false);
  });

  test("Should fail to retrieve a non-existing flag from the cached data", () => {
    const undefinedFlag = getFlag("flag");
    expect(undefinedFlag).undefined;
  });
});
