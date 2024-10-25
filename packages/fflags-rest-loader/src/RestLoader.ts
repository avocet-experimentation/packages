import {
  EnvironmentName,
  FeatureFlags,
  FlagName,
  State,
  UserGroups,
} from "@fflags/types";

export class RestLoader {
  private readonly baseUrl: string;

  // the baseUrl is dependent on where the rest service is running
  // this loader can work with any REST service
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async load(
    environmentName: EnvironmentName,
    stateName: State
  ): Promise<FeatureFlags | undefined> {
    // ensure that values are always valid
    environmentName =
      typeof environmentName === "string" ? environmentName : "testing";
    stateName = typeof stateName === "string" ? stateName : "in_test";

    try {
      const response = await fetch(
        `${this.baseUrl}?environmentName=${environmentName}&stateName=${stateName}`
      );
      const fflags = await response.json();

      // if not flag is found, log an error and return `undefined`
      if (!fflags || Object.keys(fflags).length === 0) {
        this.handleError(new Error("Empty flags"));
        return;
      }

      // map flag structure
      const cachedFlags: FeatureFlags = new Map<FlagName, UserGroups>();
      for (const fflagName in fflags) {
        cachedFlags.set(fflagName, fflags[fflagName]);
      }
      return cachedFlags;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError = (error: any): void => {
    console.log(`${new Date()}: ${error}`);
  };
}
