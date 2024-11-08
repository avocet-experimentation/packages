import {
  describe,
  test,
  beforeAll,
  vi,
  afterAll,
  expect,
  afterEach,
  beforeEach,
} from "vitest";
import { FFlagsClient } from "../src/index.js";
import {
  FeatureFlags,
  FlagName,
} from "@fflags/types";

/**
 * todo:
 * - mock the server using MSW
 * - update tests to reflect new client interface
 * - check for coverage
 */

describe("FFlagsClient", () => {
  describe("Refresh Interval", () => {
    const FIVE_SECONDS = 5000;

    let mockLoader;

    // useFakeTimers to mock the set and clear interval methods
    beforeAll(() => {
      vi.useFakeTimers(); // force time advance
    });

    beforeEach(() => {
      mockLoader = vi.fn();
    });

    // restore the loader after each test case in order to count # of times loader is called
    afterEach(() => {
      vi.restoreAllMocks();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    test("Should call the loader according to the provided interval", async () => {
      const client = await FFlagsClient.start({
        environment: "staging",
        autoRefresh: true,
        refreshIntervalInSeconds: 5,
      });
      expect(mockLoader.mock.calls.length).eq(1); // vitest mock calls is an array of arrays containing all the arguments used for each call
      vi.advanceTimersByTime(FIVE_SECONDS);
      expect(mockLoader.mock.calls.length).eq(2); // length of the mock calls array is the number of times it has been called (we are using 1 arg)
      vi.advanceTimersByTime(FIVE_SECONDS);
      expect(mockLoader.mock.calls.length).eq(3);
      client.stop();
    });

    test("Should call the loader just once", async () => {
      const client = await FFlagsClient.start({
        environment: "staging",
        autoRefresh: false,
      });
      expect(mockLoader.mock.calls.length).eq(1);
      vi.advanceTimersByTime(FIVE_SECONDS);
      expect(mockLoader.mock.calls.length).eq(1);
      client.stop();
    });
  });

  describe("Flag management", () => {
    let client: FFlagsClient;

    const mockUserGroups = (
      newAccess: boolean,
      oldAccess: boolean
    ): UserGroups => ({
      newFeatureAccess: {
        enabled: newAccess,
        value: { a: true, b: "newAccess" },
      },
      oldFeatureAccess: {
        enabled: oldAccess,
        value: { a: false, b: "oldAccess" },
      },
    });

    // ignore environment since we are returning the groups directly
    const mockLoader = async (
      _environmentName: EnvironmentName
    ): Promise<FeatureFlags> => {
      const flags: FeatureFlags = new Map<FlagName, UserGroups>();
      flags.set("flagOne", mockUserGroups(true, false));
      flags.set("flagTwo", mockUserGroups(false, true));
      return flags;
    };

    beforeAll(async () => {
      client = await FFlagsClient.start({
        environmentName: "staging",
        autoRefresh: false,
        featureFlagsLoader: mockLoader,
      });
    });

    describe("getFlag", () => {
      test("Should get the flag for newFeatureAccess group", () => {
        const actualFlagOne = client.getFlag("flagOne", "newFeatureAccess");
        const actualFlagTwo = client.getFlag("flagTwo", "newFeatureAccess");
        expect(actualFlagOne?.enabled).true;
        expect(actualFlagOne?.value).eql({ a: true, b: "newAccess" });
        expect(actualFlagTwo?.enabled).false;
        expect(actualFlagTwo?.value).eql({ a: true, b: "newAccess" });
      });

      test("Should get the flag for oldFeatureAccess group", () => {
        const actualFlagOne = client.getFlag("flagOne", "oldFeatureAccess");
        const actualFlagTwo = client.getFlag("flagTwo", "oldFeatureAccess");
        expect(actualFlagOne?.enabled).false;
        expect(actualFlagOne?.value).eql({ a: false, b: "oldAccess" });
        expect(actualFlagTwo?.enabled).true;
        expect(actualFlagTwo?.value).eql({ a: false, b: "oldAccess" });
      });

      test("Should fail to get the flag for a non-existent name", () => {
        const actualFlag = client.getFlag("flag", "oldFeatureAccess");
        expect(actualFlag).undefined;
      });

      test("Should fail to get the flag for a non-existent group", () => {
        const actualFlag = client.getFlag("flagOne", "featureAccess");
        expect(actualFlag).undefined;
      });
    });

    describe("isFlagEnabled", () => {
      test("Should return true when the flag content is enabled", () => {
        const actual = client.isFlagEnabled("flagOne", "newFeatureAccess");
        expect(actual).true;
      });

      test("Should return false when the flag content is disabled", () => {
        const actual = client.isFlagEnabled("flagOne", "oldFeatureAccess");
        expect(actual).false;
      });

      test("Should return false when the flag does not exist", () => {
        const actual = client.isFlagEnabled("flag", "newFeatureAccess");
        expect(actual).false;
      });
    });

    describe("Switching features", () => {
      describe("getFeature", () => {
        const newFeature = (a: string, b: number): string => `new ${a}, ${b}`;

        const oldFeature = (a: string, b: number): string => `old ${a}, ${b}`;

        // negate flag's enabled property
        const override =
          (flag: FeatureFlagContent) =>
          (f: FeatureFlagContent, a: string, b: number): boolean => {
            expect(f).eql(flag);
            return !flag.enabled;
          };

        test("Should return the new feature function", () => {
          // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName: "flagOne",
            userGroupName: "newFeatureAccess",
            on: newFeature,
            off: oldFeature,
          };
          const feature = client.getFeature(switchParams);
          const actual = feature("test", 123);
          const expected = "new test, 123";
          expect(actual).eq(expected);
        });

        test("Should return the old feature function", () => {
          // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName: "flagTwo",
            userGroupName: "oldFeatureAccess",
            on: oldFeature,
            off: newFeature,
          };
          const feature = client.getFeature(switchParams);
          const actual = feature("test", 123);
          const expected = "old test, 123";
          expect(actual).eq(expected);
        });

        // add override, and check if it is running the feature in the `off` property instead of the `on` property
        test("Should return the old feature (new is override)", () => {
          const flagName = "flagOne";
          const userGroupName = "newFeatureAccess";
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName,
            userGroupName,
            on: newFeature,
            off: oldFeature,
            override: override(client.getFlag(flagName, userGroupName)),
          };
          const feature = client.getFeature(switchParams);
          const actual = feature("test", 123);
          const expected = "old test, 123";
          expect(actual).eq(expected);
        });

        test("Should return the new feature (old is override)", () => {
          const flagName = "flagTwo";
          const userGroupName = "oldFeatureAccess";
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName,
            userGroupName,
            on: oldFeature,
            off: newFeature,
            override: override(client.getFlag(flagName, userGroupName)),
          };
          const feature = client.getFeature(switchParams);
          const actual = feature("test", 123);
          const expected = "new test, 123";
          expect(actual).eq(expected);
        });
      });

      describe("getAsyncFeature", async () => {
        const newFeature = async (a: string, b: number): Promise<string> =>
          `new ${a}, ${b}`;

        const oldFeature = async (a: string, b: number): Promise<string> =>
          `old ${a}, ${b}`;

        // negate flag's enabled property
        const override =
          (flag: FeatureFlagContent) =>
          async (
            f: FeatureFlagContent,
            a: string,
            b: number
          ): Promise<boolean> => {
            expect(f).eql(flag);
            return new Promise((resolve) => {
              setTimeout(() => resolve(!flag.enabled), 5);
            });
          };

        test("Should return the new feature function", async () => {
          // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName: "flagOne",
            userGroupName: "newFeatureAccess",
            on: newFeature,
            off: oldFeature,
          };
          const feature = client.getFeature(switchParams);
          const actual = await feature("test", 123);
          const expected = "new test, 123";
          expect(actual).eq(expected);
        });

        test("Should return the old feature function", async () => {
          // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName: "flagTwo",
            userGroupName: "oldFeatureAccess",
            on: oldFeature,
            off: newFeature,
          };
          const feature = client.getFeature(switchParams);
          const actual = await feature("test", 123);
          const expected = "old test, 123";
          expect(actual).eq(expected);
        });

        test("Should return the old feature (new is override)", async () => {
          const flagName = "flagOne";
          const userGroupName = "newFeatureAccess";
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName,
            userGroupName,
            on: newFeature,
            off: oldFeature,
            override: override(client.getFlag(flagName, userGroupName)),
          };
          const feature = client.getAsyncFeature(switchParams);
          const actual = await feature("test", 123);
          const expected = "old test, 123";
          expect(actual).eq(expected);
        });

        test("Should return the new feature (old is override)", async () => {
          const flagName = "flagTwo";
          const userGroupName = "oldFeatureAccess";
          const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
            flagName,
            userGroupName,
            on: oldFeature,
            off: newFeature,
            override: override(client.getFlag(flagName, userGroupName)),
          };
          const feature = client.getAsyncFeature(switchParams);
          const actual = await feature("test", 123);
          const expected = "new test, 123";
          expect(actual).eq(expected);
        });
      });
    });
  });
});
