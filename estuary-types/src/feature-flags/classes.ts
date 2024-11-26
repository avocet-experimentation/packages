import { z } from "zod";
import { featureFlagDraftSchema, OverrideRuleUnion } from "./schema.js";
import {
  FlagValueDefImpl,
  FlagValueFromTypeDef,
  FlagValueTypeDef,
 } from "./flag-value.js";
import { FeatureFlag } from "../shared/imputed.js";
import { RequireOnly } from "../helpers/utility-types.js";


export class FeatureFlagDraft<T extends FlagValueTypeDef = FlagValueTypeDef> 
  implements z.infer<typeof featureFlagDraftSchema> {

  name: string;
  description: string | null;
  value: FlagValueFromTypeDef<T>;
  environmentNames: Record<string, true>;
  overrideRules: OverrideRuleUnion[];

  constructor(featureFlagDraft: FeatureFlagDraft<T>) {
    this.name = featureFlagDraft.name;
    this.description = featureFlagDraft.description;
    this.value = featureFlagDraft.value;
    this.environmentNames = featureFlagDraft.environmentNames;
    this.overrideRules = featureFlagDraft.overrideRules;
  }

  // #region Helpers for working with FeatureFlags
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
  // #endregion
  
  // #region Templates
  static template<T extends FlagValueTypeDef>(
    partialFlagDraft: RequireOnly<FeatureFlagDraft<T>, 'name' | 'value'> 
      & { value: FlagValueDefImpl<T> },
  ) {
    const defaults = {
      description: null,
      environmentNames: {},
      overrideRules: [],
    };

    return new FeatureFlagDraft<T>({ ...defaults, ...partialFlagDraft });
  }

  static templateBoolean(
    partialFlagDraft: RequireOnly<FeatureFlagDraft<'boolean'>, 'name'>
  ): FeatureFlagDraft<'boolean'> {
    return this.template({
      ...partialFlagDraft,
      value: FlagValueDefImpl.template('boolean'),
    });
  }

  static templateString(
    partialFlagDraft: RequireOnly<FeatureFlagDraft<'string'>, 'name'>
  ): FeatureFlagDraft<'string'> {
    return this.template({
      ...partialFlagDraft,
      value: FlagValueDefImpl.template('string'),
    });
  }

  static templateNumber(
    partialFlagDraft: RequireOnly<FeatureFlagDraft<'number'>, 'name'>
  ): FeatureFlagDraft<'number'> {
    return this.template({
      ...partialFlagDraft,
      value: FlagValueDefImpl.template('number'),
    });
  }
  // #endregion
}
