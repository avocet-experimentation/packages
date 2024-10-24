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
            trackingEvents: [],
            value: 100,
          },
          oldFeatureAccess: {
            enabled: false,
            trackingEvents: [],
            value: 200,
          },
        },
      },
      production: {
        userGroups: {
          newFeatureAccess: {
            enabled: false,
            trackingEvents: [],
            value: 300,
          },
          oldFeatureAccess: {
            enabled: true,
            trackingEvents: [],
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
            trackingEvents: [],
            value: 400,
          },
          oldFeatureAccess: {
            enabled: true,
            trackingEvents: [],
            value: 300,
          },
        },
      },
      production: {
        userGroups: {
          newFeatureAccess: {
            enabled: true,
            trackingEvents: [],
            value: 200,
          },
          oldFeatureAccess: {
            enabled: false,
            trackingEvents: [],
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
