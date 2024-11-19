import { EnvironmentName } from "../environments.js";
import { FeatureFlagDraft } from "../featureFlags.js";
import { FlagEnvironmentMapping } from "../flags/flagEnvironments.js";
import { FlagValueDef } from "../flags/flagValues.js";
import {
  FlagEnvironmentPropsTemplate,
} from "./FeatureFlagSubclasses.js";

export class FeatureFlagDraftImpl implements FeatureFlagDraft {
  name: string;
  description?: string;
  value: FlagValueDef;
  environments: FlagEnvironmentMapping;

  constructor({ name, description, value, environments}: FeatureFlagDraft) {
    this.name = name;
    this.description = description;
    this.value = value;
    this.environments = environments;
  }

  environmentData(environmentName: EnvironmentName) {
    if (!(environmentName in this.environments)) {
      Object.assign(
        this.environments, {
          [environmentName]: new FlagEnvironmentPropsTemplate(environmentName),
      });
    }

    return this.environments[environmentName];
  }

  
}
