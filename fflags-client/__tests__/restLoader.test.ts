import { describe, expect, Mock, test, vi } from "vitest";
import { RestLoader } from "../../fflags-rest-loader/src/index.js";

describe("RestLoader", () => {
  const BASE_URL = "http://localhost:3524/api/fflags/caching";

  global.fetch = vi.fn(); // mocked `fetch`

  // mocking the json function, which returns a promise with the data passed to it
  const createFetchResponse = (data?: any) => ({
    json: () => new Promise((resolve) => resolve(data)),
  });

  const expectedFlags = {
    flag1: {
      newFeatureAccess: {
        enabled: true,
        value: 100,
      },
      oldFeatureAccess: {
        enabled: false,
        value: 200,
      },
    },
  };

  // working as expected
  test("successfully gets the flags from the endpoint", async () => {
    (fetch as Mock).mockResolvedValue(createFetchResponse(expectedFlags)); // mock expected result when the code calls fetch
    const loader = new RestLoader(BASE_URL);
    const fflags = await loader.load("staging");
    expect(fflags?.get("flag1")).eql(expectedFlags.flag1); // deep compare fflags object
  });

  // test error
  test("should fail trying to get the flags (invalid data)", async () => {
    (fetch as Mock).mockResolvedValue(createFetchResponse());
    const loader = new RestLoader(BASE_URL);
    const fflags = await loader.load("staging");
    expect(fflags).undefined; // should return undefined when an error occurs
  });
});
