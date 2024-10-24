import { EnvironmentName, FlagName, UserGroups } from "@fflags/types";

// Outer-scope feature flag properties;
// these props will act as the configuration of how the test groups are tested, recorded, and distributed.

export type CachingParams = {
  environmentName: EnvironmentName;
};

export type FlagIdParams = {
  fflagId: string;
};

export type Metrics = {
  primary: string;
  secondary?: string;
};

// need to finish
export type TrafficAllocation = {};

export type TargetingRules = {
  geo?: string;
  segment?: string;
  device?: string;
  trafficAllocation?: TrafficAllocation;
};

export type State =
  | "draft"
  | "active"
  | "in_test"
  | "paused"
  | "completed"
  | "disabled"
  | "archived";

export type EnvironmentContent = {
  rollout: number;
  userGroups: UserGroups;
};

export type FFlag = {
  name: FlagName;
  description: string;
  state: State;
  metrics?: Metrics;
  targetingRules?: TargetingRules;
  environments: Record<EnvironmentName, EnvironmentContent>;
};

export type FFlags = Record<FlagName, FFlag>;

export type AuditableFFlag = FFlag & {
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFFlagBodyRequest = FFlag;

export type CreateFFlagBodyResponse = AuditableFFlag & {
  id: string;
};

export type UpdateFFlagBodyRequest = CreateFFlagBodyResponse;

export type UpdateFFlagBodyResponse = UpdateFFlagBodyRequest;

export type GetFFlagBodyResponse = UpdateFFlagBodyRequest;
