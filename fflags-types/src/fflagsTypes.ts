export type FlagName = string;

export type FlagEnvironmentName = "prod" | "dev" | "testing";

// export type FlagEnvironments = {
//   [key in FlagEnvironmentName]: FlagEnvironment;
// };

export type FlagEnvironments = Map<FlagEnvironmentName, FlagEnvironment>;

export type FlagEnvironment = {
  enabled: boolean;
  // overrideRules: OverrideRule[];
};

export type FeatureFlag = {
  id: string;
  name: FlagName;
  description: string;
  createdAt: number;
  updatedAt: number;
  environments: FlagEnvironments; // store envName: enabled
} & ( //indicates the active state when the flag is enabled.
  | { valueType: "boolean"; defaultValue: boolean } //
  | { valueType: "string"; defaultValue: string }
  | { valueType: "number"; defaultValue: number }
);

/*
  - Hashed data structure (O(1) read time)
  - Faster than using an object key as an index
    with holding data for two groups (control & experiment)
*/
export type FeatureFlags = Record<FlagName, FlagContent>;

export type FeatureFlagLoader = (
  environment: FlagEnvironmentName[]
) => Promise<FeatureFlags>;

export type ConfigOptions = {
  environments: FlagEnvironmentName[];
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  featureFlagsLoader: FeatureFlagLoader;
};

// eslint-disable-next-line
type AnyArgs = any[]; // represents any set of arguments passed to a function

// Using as a base for other types
// eslint-disable-next-line
export type AnyFunction = (...args: AnyArgs) => any; // signature of any function

export type FeatureFunction<Args extends AnyArgs, Result> = (
  ...args: Args
) => Result;

export type OverrideFuction<F extends AnyFunction> = (
  flag: FlagContent,

  ...args: Parameters<F>
) => boolean | Promise<boolean>;

// contains the information we need to choose between two features depending on the flag status
// i.e. `on` for enabled, `off` for disabled
export type FeatureFlagSwitchParams<F extends AnyFunction> = {
  flagName: FlagName;
  on: FeatureFunction<Parameters<F>, ReturnType<F>>;
  off: FeatureFunction<Parameters<F>, ReturnType<F>>;
  override?: OverrideFuction<F>;
};
