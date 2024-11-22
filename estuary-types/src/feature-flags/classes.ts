import { z } from "zod";
import { featureFlagDraftSchema, OverrideRuleUnion } from "./schema.js";
import { FlagValueDefImpl } from "./child-classes.js";
import { FeatureFlag } from "../shared/imputed.js";
import { FlagValueFromTypeDef, FlagValueTypeDef } from "../helpers/flag-value.js";
import { RequireOnly } from "../helpers/utility-types.js";


export class FeatureFlagDraft<T extends FlagValueTypeDef = FlagValueTypeDef> implements z.infer<typeof featureFlagDraftSchema> {
  name: string;
  description: string | null;
  value: FlagValueFromTypeDef<T>;
  environmentNames: string[];
  overrideRules: OverrideRuleUnion[];

  constructor(featureFlagDraft: FeatureFlagDraft<T>) {
    this.name = featureFlagDraft.name;
    this.description = featureFlagDraft.description;
    this.value = featureFlagDraft.value;
    this.environmentNames = featureFlagDraft.environmentNames;
    this.overrideRules = featureFlagDraft.overrideRules;
  }

  static template<T extends FlagValueTypeDef>(
    partialFlagDraft: RequireOnly<FeatureFlagDraft<T>, 'name' | 'value'> 
      & { value: FlagValueDefImpl<T> },
  ) {
    const defaults = {
      description: null,
      environmentNames: [],
      overrideRules: [],
    };

    return new FeatureFlagDraft({ ...defaults, ...partialFlagDraft });
  }

  /* Helpers for working with FeatureFlags */
  /**
   * Get all rules on a flag corresponding to the passed environment name
   */
  static getEnvironmentRules(
    flag: FeatureFlagDraft | FeatureFlag,
    environmentName: string,
  ) {
      return flag.overrideRules
        .filter((rule) => rule.environmentName === environmentName);
  }
}
