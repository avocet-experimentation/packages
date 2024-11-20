import { EnvironmentName } from "../environments.js";
import { FlagEnvironmentPropsTemplate } from "../classes/FeatureFlagSubclasses.js";
import { FeatureFlagDraft } from "../classes/FeatureFlag.js";

/**
 * Helpers for working with FeatureFlags
 */

export class FeatureFlagManager {
  static environmentData(flag: FeatureFlagDraft, environmentName: EnvironmentName) {
    if (!(environmentName in flag.environments)) {
      Object.assign(
        flag.environments, {
        [environmentName]: new FlagEnvironmentPropsTemplate(environmentName),
      });
    }

    return flag.environments[environmentName];
  }
}
