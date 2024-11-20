import { z } from "zod";
import { featureFlagDraftSchema, FlagEnvironmentMapping } from "../featureFlags.js";
import { FlagValueDef } from "../flags/flagValues.js";
import {
  FlagValueDefTemplate,
  FlagEnvironmentMappingTemplate,
  FlagEnvironmentPropsTemplate,
 } from "./FeatureFlagSubclasses.js";
import { EnvironmentName } from "../environments.js";
import { FeatureFlag } from "../imputed.js";

export class FeatureFlagDraft implements z.infer<typeof featureFlagDraftSchema> {
  name: string;
  description?: string;
  value: FlagValueDef;
  environments: FlagEnvironmentMapping;

  constructor(draft: FeatureFlagDraft) {
    this.name = draft.name;
    this.description = draft.description;
    this.value = draft.value;
    this.environments = draft.environments;
  }

  /* Helpers for working with FeatureFlags */
  /**
   * Get the data for a given environment on a draft or completed feature flag
   */
  static environmentData(flag: FeatureFlagDraft | FeatureFlag, environmentName: EnvironmentName) {
    if (!(environmentName in flag.environments)) {
      Object.assign(
        flag.environments, {
        [environmentName]: new FlagEnvironmentPropsTemplate(environmentName),
      });
    }

    return flag.environments[environmentName];
  }
}


export class FeatureFlagDraftTemplate extends FeatureFlagDraft {
  constructor(name: string, dataType: "string" | "number" | "boolean") {
    const defaults = {
      value: new FlagValueDefTemplate(dataType) as FlagValueDef,
      environments: new FlagEnvironmentMappingTemplate(),
    };

    super({ name, ...defaults });
  }
}


