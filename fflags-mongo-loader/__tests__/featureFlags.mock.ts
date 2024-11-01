import { FFlagModel } from "../src/index.js";

export const mockedFeatureFlagsInDB = [
  {
    name: "falseFlag",
    valueType: "boolean",
    defaultValue: false,
    environments: {
      dev: {
        enabled: true,
      },
      testing: {
        enabled: false,
      },
      prod: {
        enabled: false,
      },
    },
  },
  {
    name: "trueFlag",
    valueType: "boolean",
    defaultValue: false,
    environments: {
      dev: {
        enabled: true,
      },
      testing: {
        enabled: false,
      },
      prod: {
        enabled: false,
      },
    },
  },
];

// populate our database in memory from the mocked data
export const populateMockDB = async () => {
  for (const flag of mockedFeatureFlagsInDB) {
    await FFlagModel.create(flag);
  }
};
