import { z } from "zod";
import { featureFlagDraftSchema, OverrideRuleUnion } from "./schema.js";
import {
  FlagValueDefTemplate,
  FlagEnvironmentMappingTemplate,
  FlagEnvironmentPropsTemplate,
  FlagEnvironmentMapping,
 } from "./child-classes.js";
import { FeatureFlag } from "../shared/imputed.js";
import { FlagValueDef } from "../helpers/flag-value.js";
import { RequireOnly } from "../helpers/utility-types.js";

export class FeatureFlagDraft implements z.infer<typeof featureFlagDraftSchema> {
  name: string;
  description: string | null;
  value: FlagValueDef;
  environments: FlagEnvironmentMapping;

  constructor(featureFlagDraft: FeatureFlagDraft) {
    this.name = featureFlagDraft.name;
    this.description = featureFlagDraft.description;
    this.value = featureFlagDraft.value;
    this.environments = featureFlagDraft.environments;
  }

  /* Helpers for working with FeatureFlags */
  /**
   * Get the data for a given environment on a draft or completed feature flag
   */
  static environmentData(flag: FeatureFlagDraft | FeatureFlag, environmentName: string) {
    if (!(environmentName in flag.environments)) {
      Object.assign(
        flag.environments, {
        [environmentName]: new FlagEnvironmentPropsTemplate({ name: environmentName }),
      });
    }

    return flag.environments[environmentName];
  }

  /**
   * Get all rules on a flag corresponding to the passed environment name, or 
   * all its rules if none are passed
   */
  static getRules(flag: FeatureFlagDraft | FeatureFlag, environmentName?: string) {
    if (!environmentName) {
      const collatedRules = Object.values(flag.environments)
        .reduce(
          (acc, { overrideRules }) => acc.concat(overrideRules),
          [] as OverrideRuleUnion[],
        );
      return collatedRules;
    } else if (isKeyOf(environmentName, flag.environments)) {
      return flag.environments[environmentName].overrideRules;
    } else {
      return [];
    }
  }
}

function isKeyOf<T extends Record<any, any>>(
  possibleKey: string | number | symbol,
  obj: T,
): possibleKey is keyof T {
  return (possibleKey in obj 
    && (
      typeof possibleKey !== 'symbol' && obj[possibleKey] !== undefined
      || obj.possibleKey !== undefined
    )
  );
}

export class FeatureFlagDraftTemplate extends FeatureFlagDraft {
  constructor(partialFlagDraft: RequireOnly<FeatureFlagDraft, 'name' | 'value'>) {
    const defaults = {
      description: null,
      environments: new FlagEnvironmentMappingTemplate(),
    };

    super({ ...defaults, ...partialFlagDraft });
  }
}


