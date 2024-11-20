import { z } from "zod";
import { EnvironmentName } from "../environments.js";
import {
  OverrideRuleUnion,
  FlagEnvironmentMapping,
  flagEnvironmentPropsSchema
} from "../featureFlags.js";
import { FlagValueTypeDef, FlagCurrentValue, FlagValueDef } from "../flags/flagValues.js";


class FlagValueDefImpl {
  type: FlagValueTypeDef;
  initial: FlagCurrentValue;

  constructor({ type, initial }: FlagValueDef) {
    this.type = type;
    this.initial = initial;
  }
}
export class FlagValueDefTemplate extends FlagValueDefImpl {
  constructor(type: FlagValueTypeDef) {
    let defaults: FlagValueDef = { type: 'boolean' as const, initial: false };
    if (type === 'string') defaults = { type: 'string' as const, initial: '' };
    else if (type === 'number') defaults = { type: 'number' as const, initial: 0 };
    super(defaults);
  }
}
/**
 * Environment-specific data for a `FeatureFlag`
 */
export class FlagEnvironmentProps implements z.infer<typeof flagEnvironmentPropsSchema> {
  name: EnvironmentName;
  enabled: boolean;
  overrideRules: OverrideRuleUnion[];

  constructor({
    name,
    enabled,
    overrideRules,
  }: FlagEnvironmentProps) {
    this.name = name;
    this.enabled = enabled;
    this.overrideRules = overrideRules;
  }

}

export class FlagEnvironmentPropsTemplate extends FlagEnvironmentProps {
  constructor(environmentName: EnvironmentName) {
    const defaults = {
      enabled: false,
      overrideRules: [],
    }
    super({ name: environmentName, ...defaults });
  }
}

class FlagEnvironmentMappingImpl implements FlagEnvironmentMapping {
  prod: FlagEnvironmentProps;
  dev: FlagEnvironmentProps;
  testing: FlagEnvironmentProps;
  staging: FlagEnvironmentProps;

  constructor({ prod, dev, testing, staging }: FlagEnvironmentMapping) {
    this.prod = prod ?? new FlagEnvironmentPropsTemplate('prod');
    this.dev = dev ?? new FlagEnvironmentPropsTemplate('dev');
    this.testing = testing ?? new FlagEnvironmentPropsTemplate('testing');
    this.staging = staging ?? new FlagEnvironmentPropsTemplate('staging');
  }
}
export class FlagEnvironmentMappingTemplate extends FlagEnvironmentMappingImpl {
  constructor() {
    const defaults = {
      prod: new FlagEnvironmentPropsTemplate('prod'),
      dev: new FlagEnvironmentPropsTemplate('dev'),
      testing: new FlagEnvironmentPropsTemplate('testing'),
      staging: new FlagEnvironmentPropsTemplate('staging'),
    };

    super(defaults);
  }
}
