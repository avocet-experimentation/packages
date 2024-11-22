import { z } from "zod";
import {
  OverrideRuleUnion,
  flagEnvironmentPropsSchema,
  flagEnvironmentMappingSchema
} from "./schema.js";
import { FlagValueTypeDef, FlagCurrentValue, FlagValueDef } from "../helpers/flag-value.js";
import { RequireOnly } from "../helpers/utility-types.js";


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
  name: string;
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
  constructor(partialFlagEnvProps: RequireOnly<FlagEnvironmentProps, 'name'>) {
    const defaults = {
      enabled: false,
      overrideRules: [],
    }
    super({ ...defaults, ...partialFlagEnvProps });
  }
}
/**
 * Mapping of environment names to `FlagEnvironmentProps`.
 */
export class FlagEnvironmentMapping implements z.infer<typeof flagEnvironmentMappingSchema> {
  [environmentName: string]: FlagEnvironmentProps;

  constructor(mapping: FlagEnvironmentMapping) {
    Object.entries(mapping).forEach(([environmentName, props]) => {
      this[environmentName] = props;
    })
  }
}

/**
 * todo: 
 * - make this implementation take either of:
 *   - an array of environment names
 *   - an array of [name, FlagEnvironmentProps] entries
 * 
 * and remove the defaults
 */
export class FlagEnvironmentMappingTemplate extends FlagEnvironmentMapping {
  constructor(partialFlagEnvMapping?: FlagEnvironmentMapping) {
    const defaults = {
      prod: new FlagEnvironmentPropsTemplate({ name: 'prod' }),
      dev: new FlagEnvironmentPropsTemplate({ name: 'dev' }),
      testing: new FlagEnvironmentPropsTemplate({ name: 'testing' }),
      staging: new FlagEnvironmentPropsTemplate({ name: 'staging' }),
    };

    super({ ...defaults, ...partialFlagEnvMapping });
  }
}
