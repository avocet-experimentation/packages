import { FFlagModel } from "../src/index.js";

export const mockedFeatureFlagsInDB = [
  {
    name: "flagOne",
    description: "flagOne",
    environments: {
      staging: {
        userGroups: {
          newFeatureAccess: {
            enabled: true,
            value: 100,
          },
          oldFeatureAccess: {
            enabled: false,
            value: 200,
          },
        },
      },
      production: {
        userGroups: {
          newFeatureAccess: {
            enabled: false,
            value: 300,
          },
          oldFeatureAccess: {
            enabled: true,
            value: 400,
          },
        },
      },
    },
  },
  {
    name: "flagTwo",
    description: "flagTwo",
    environments: {
      staging: {
        userGroups: {
          newFeatureAccess: {
            enabled: false,
            value: 400,
          },
          oldFeatureAccess: {
            enabled: true,
            value: 300,
          },
        },
      },
      production: {
        userGroups: {
          newFeatureAccess: {
            enabled: true,
            value: 200,
          },
          oldFeatureAccess: {
            enabled: false,
            value: 100,
          },
        },
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
