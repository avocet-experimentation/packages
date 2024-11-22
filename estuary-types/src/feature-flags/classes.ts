import { z } from "zod";
import { featureFlagDraftSchema, OverrideRuleUnion } from "./schema.js";
import {
  FlagEnvironmentMappingTemplate,
  FlagEnvironmentPropsTemplate,
  FlagEnvironmentMapping,
  FlagValueDefImpl,
 } from "./child-classes.js";
import { FeatureFlag } from "../shared/imputed.js";
import { FlagValueDef, FlagValueFromTypeDef, FlagValueTypeDef } from "../helpers/flag-value.js";
import { RequireOnly } from "../helpers/utility-types.js";

type DraftRequired<T extends FlagValueTypeDef> = RequireOnly<FeatureFlagDraft<T>, 'name' | 'value'>;

export class FeatureFlagDraft<T extends FlagValueTypeDef = FlagValueTypeDef> implements z.infer<typeof featureFlagDraftSchema> {
  name: string;
  description: string | null;
  value: FlagValueFromTypeDef<T>;
  environments: FlagEnvironmentMapping;

  constructor(featureFlagDraft: FeatureFlagDraft<T>) {
    this.name = featureFlagDraft.name;
    this.description = featureFlagDraft.description;
    this.value = featureFlagDraft.value;
    this.environments = featureFlagDraft.environments;
  }

  static template<T extends FlagValueTypeDef>(
    partialFlagDraft: DraftRequired<T> & { value: FlagValueDefImpl<T> },
  ) {
    const defaults = {
      description: null,
      environments: new FlagEnvironmentMappingTemplate(),
    };

    return new FeatureFlagDraft({ ...defaults, ...partialFlagDraft });
  }

  /* Helpers for working with FeatureFlags */
  /**
   * Get the data for a given environment on a draft or completed feature flag
   */
  static environmentData<T extends FlagValueTypeDef>(flag: FeatureFlagDraft<T> | FeatureFlag, environmentName: string) {
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
  static getRules<T extends FlagValueTypeDef>(
    flag: FeatureFlagDraft<T> | FeatureFlag,
    environmentName?: string,
  ) {
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

// export class FeatureFlagDraftTemplate extends FeatureFlagDraft {
//   constructor(partialFlagDraft: RequireOnly<FeatureFlagDraft, 'name' | 'value'>) {
//     const defaults = {
//       description: null,
//       environments: new FlagEnvironmentMappingTemplate(),
//     };

//     super({ ...defaults, ...partialFlagDraft });
//   }
// }