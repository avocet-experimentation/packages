import { z } from "zod";
import { OverrideRule } from "./overrideRules.types.js";
import { clientFlagMappingSchema, environmentNameSchema, featureFlagSchema } from "./fflags.schema.js";

export type FlagName = string;

export type FlagEnvironmentName = z.infer<typeof environmentNameSchema>;

export interface FlagEnvironment {
  enabled: boolean;
  overrideRules: OverrideRule[];
};

export type FlagEnvironments = Record<FlagEnvironmentName, FlagEnvironment>;

/**
 * Flag objects available in the backend
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
/**
 * Feature flag data available to the client SDK
 */
export interface FeatureFlagClientData extends Pick<FeatureFlag, 'name' | 'valueType' | 'defaultValue'> {
  currentValue: string;
}

export type ClientFlagMapping = z.infer<typeof clientFlagMappingSchema>;

/**
 * A map of flag names to properties
 */
export type FeatureFlags = Record<FlagName, FeatureFlag>;

// // eslint-disable-next-line
// type AnyArgs = any[]; // represents any set of arguments passed to a function

// Using as a base for other types
// // eslint-disable-next-line
// export type AnyFunction = (...args: AnyArgs) => any; // signature of any function

// export type FeatureFunction<Args extends AnyArgs, Result> = (
//   ...args: Args
// ) => Result;

// export type OverrideFunction<F extends AnyFunction> = (
//   flag: FeatureFlag,

//   ...args: Parameters<F>
// ) => boolean | Promise<boolean>;

// contains the information we need to choose between two features depending on the flag status
// i.e. `on` for enabled, `off` for disabled
// export type FeatureFlagSwitchParams<F extends AnyFunction> = {
//   flagName: FlagName;
//   on: FeatureFunction<Parameters<F>, ReturnType<F>>;
//   off: FeatureFunction<Parameters<F>, ReturnType<F>>;
//   override?: OverrideFunction<F>;
// };
