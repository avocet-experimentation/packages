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
import { EstuaryClient } from "../src/index.js";
import {
  EnvironmentName,
  flagAttributesSchema,
  FlagClientMapping,
  FlagName,
} from "@estuary/types";
import { ClientOptions } from "../src/clientTypes.js";
import { randomUUID } from "crypto";

/**
 * todo:
 * - mock the server using MSW
 * - create a flag called 'flagOne'
 * - update tests to reflect new client interface
 * - check for coverage
 */

const TESTING_ENVIRONMENT = 'testing';

const defaultClientOptions: ClientOptions = {
  environment: TESTING_ENVIRONMENT,
  autoRefresh: true,
  apiUrl: 'localhost:4444',
  clientProps: {
    id: 'test-user-id',
  }
}

describe("EstuaryClient", () => {
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
      const client = await EstuaryClient.start({
        ...defaultClientOptions,
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
      const client = await EstuaryClient.start({
        ...defaultClientOptions,
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
    let client: EstuaryClient;

    beforeAll(async () => {
      client = await EstuaryClient.start({
        ...defaultClientOptions,
        environment: "staging",
        autoRefresh: false,
      });
    });

    describe("flagValue", () => {
      test("Fails to get the flag for a non-existent flag", () => {
        const actualFlag = client.flagValue("fake-feature-flag");
        expect(actualFlag).toBeNull();
      });

      test("Gets the value of a real flag", () => {
        const actualFlag = client.flagValue("flagOne");
        expect(actualFlag).toBeNull();
      });
    });

    describe("getFlagAttributes", () => {
      test("Returns null for a non-existent flag", () => {
        const result = client.getFlagAttributes("fake-feature-flag");
        expect(result).toBeNull();
      });

      test("Returns a correctly formatted object for a real flag", () => {
        const result = client.getFlagAttributes("flagOne");
        expect(flagAttributesSchema.parse(result)).not.toThrow();
      });
    });

    // describe("getAsyncFeature", async () => {
    //   const newFeature = async (a: string, b: number): Promise<string> =>
    //     `new ${a}, ${b}`;

    //   const oldFeature = async (a: string, b: number): Promise<string> =>
    //     `old ${a}, ${b}`;

    //   // negate flag's enabled property
    //   const override =
    //     (flag: FeatureFlagContent) =>
    //     async (
    //       f: FeatureFlagContent,
    //       a: string,
    //       b: number
    //     ): Promise<boolean> => {
    //       expect(f).eql(flag);
    //       return new Promise((resolve) => {
    //         setTimeout(() => resolve(!flag.enabled), 5);
    //       });
    //     };

    //   test("Should return the new feature function", async () => {
    //     // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
    //     const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
    //       flagName: "flagOne",
    //       userGroupName: "newFeatureAccess",
    //       on: newFeature,
    //       off: oldFeature,
    //     };
    //     const feature = client.getFeature(switchParams);
    //     const actual = await feature("test", 123);
    //     const expected = "new test, 123";
    //     expect(actual).eq(expected);
    //   });

    //   test("Should return the old feature function", async () => {
    //     // using `typeof oldFeature` in our type parameter to ensure that `on` and `off` functions have its same signature
    //     const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
    //       flagName: "flagTwo",
    //       userGroupName: "oldFeatureAccess",
    //       on: oldFeature,
    //       off: newFeature,
    //     };
    //     const feature = client.getFeature(switchParams);
    //     const actual = await feature("test", 123);
    //     const expected = "old test, 123";
    //     expect(actual).eq(expected);
    //   });

    //   test("Should return the old feature (new is override)", async () => {
    //     const flagName = "flagOne";
    //     const userGroupName = "newFeatureAccess";
    //     const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
    //       flagName,
    //       userGroupName,
    //       on: newFeature,
    //       off: oldFeature,
    //       override: override(client.getFlag(flagName, userGroupName)),
    //     };
    //     const feature = client.getAsyncFeature(switchParams);
    //     const actual = await feature("test", 123);
    //     const expected = "old test, 123";
    //     expect(actual).eq(expected);
    //   });

    //   test("Should return the new feature (old is override)", async () => {
    //     const flagName = "flagTwo";
    //     const userGroupName = "oldFeatureAccess";
    //     const switchParams: FeatureFlagSwitchParams<typeof oldFeature> = {
    //       flagName,
    //       userGroupName,
    //       on: oldFeature,
    //       off: newFeature,
    //       override: override(client.getFlag(flagName, userGroupName)),
    //     };
    //     const feature = client.getAsyncFeature(switchParams);
    //     const actual = await feature("test", 123);
    //     const expected = "new test, 123";
    //     expect(actual).eq(expected);
    //   });
    // });
  });
});
