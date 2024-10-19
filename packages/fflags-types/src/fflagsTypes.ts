export type FeatureFlagContent = {
  enabled: boolean
  value?: unknown // allow for object, string, or number
};

export type FlagName = string;

export type UserGroupName = string;

export type UserGroups = Record<UserGroupName, FeatureFlagContent>;

export type FeatureFlags = Map<FlagName, UserGroups>;

export type EnvironmentName = string;

export type FeatureFlagsLoader = (environmentName: EnvironmentName) => Promise<FeatureFlags>;

export type FeatureFlagsStartingOptions = {
  environmentName: EnvironmentName
  autoRefresh: boolean
  refreshIntervalInSeconds?: number
  featureFlagsLoader: FeatureFlagsLoader
};

// eslint-disable-next-line
type AnyArgs = any[]; // represents any set of arguments passed to a function

// Using as a base for other types
// eslint-disable-next-line
export type AnyFunction = (...args: AnyArgs) => any; // signature of any function

export type FeatureFunction<Args extends AnyArgs, Result> = (...args: Args) => Result;

export type OverrideFuction<F extends AnyFunction> = (flag: FeatureFlagContent, ...args: Parameters<F>) => boolean | Promise<boolean>

// contains the informationo we need to choose between two features depending on the flag status
// i.e. `on` for enabled, `off` for disabled
export type FeatureFlagSwitchParams<F extends AnyFunction> = {
  flagName: FlagName
  userGroupName: UserGroupName
  on: FeatureFunction<Parameters<F>, ReturnType<F>>
  off: FeatureFunction<Parameters<F>, ReturnType<F>>
  override?: OverrideFuction<F>
}