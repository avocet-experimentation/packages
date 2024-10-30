export type FeatureFlagContent = {
  enabled: boolean; // true
  rollout: number;
  value?: unknown; // allow for object, string, or number
  startDate?: Date; // "2024-10-20"
  endDate?: Date; // "2024-11-20"
  goals?: {
    primary?: string; // "conversion_rate"
    secondary?: string; // "reduce_bounce_rate"
  };
  trackingEvents?: string[]; // ["click", "conversion"]
};

export type FlagName = string;

export type UserGroupName = string;

/*
  - Key-value pair
  - Can be small, since it will only be concerned
    with holding data for two groups (control & experiment)
*/
export type UserGroups = Record<UserGroupName, FeatureFlagContent>;

/*
  - Hashed data structure (O(1) read time)
  - Faster than using an object key as an index
    with holding data for two groups (control & experiment)
*/
export type FeatureFlags = Map<FlagName, UserGroups>;

export type EnvironmentName = string;

export type State =
  | "draft"
  | "active"
  | "in_test"
  | "paused"
  | "completed"
  | "disabled"
  | "archived";

export type StateName = State | undefined;

export type FeatureFlagsLoader = (
  environmentName: EnvironmentName,
  state?: StateName
) => Promise<FeatureFlags>;

export type FeatureFlagsStartingOptions = {
  environmentName: EnvironmentName;
  stateName?: StateName;
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
  userGroupName: UserGroupName;
  on: FeatureFunction<Parameters<F>, ReturnType<F>>;
  off: FeatureFunction<Parameters<F>, ReturnType<F>>;
  override?: OverrideFuction<F>;
};
