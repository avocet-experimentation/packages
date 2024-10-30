export type FlagName = string;

export type Environment = "prod" | "dev" | "testing";

export type TargetingRule = string[];

export type FeatureFlagContent = {
  name: FlagName;
  description: string;
  enabled: boolean; // acts as high-level on/off switch
  status: Status;
  targetingRules?: TargetingRule[];
  createdAt: number;
  updatedAt?: number;
  environments: { [key in Environment]: boolean }; // store envName: enabled
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
export type FeatureFlags = Map<FlagName, FeatureFlagContent>;

export type Status =
  | "draft"
  | "active"
  | "in_test"
  | "paused"
  | "completed"
  | "disabled"
  | "archived";

export type FeatureFlagsLoader = (
  environment: Environment,
  status: Status
) => Promise<FeatureFlags>;

export type FeatureFlagsStartingOptions = {
  environment: Environment;
  status: Status;
  autoRefresh: boolean;
  refreshIntervalInSeconds?: number;
  featureFlagsLoader: FeatureFlagsLoader;
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
  flag: FeatureFlagContent,
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
