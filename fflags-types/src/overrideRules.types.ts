import { FeatureFlag } from "./fflags.types.js";
import { EventTelemetry } from "./telemetry.types.js";

export type ClientAttributeData = 'string' | 'number' | 'boolean';

export type ClientSessionAttribute = {
  name: string;
  dataType: ClientAttributeData;
}

export type RuleStatus =
  | "draft"
  | "active"
  | "in_test"
  | "paused"
  | "completed"
  | "disabled"
  | "archived";

export interface OverrideRule {
  id: string;
  description: string; // default to empty string
  status: RuleStatus; // defaults to 'disabled'
  startTimestamp?: number; // unix timestamp | undefined if never enabled
  endTimestamp?: number;
  enrollment: {
    attributes: ClientSessionAttribute[]; // keys for the values sent to the experimentation server and consistently hashed for random assignment
    proportion: number; // 0 < proportion <= 1
  };
}


// for supporting multivariate experiments later
export interface Intervention { [flagId: string]: string }

// a block defines an intervention for a group
export interface ExperimentBlock {
  id: string;
  name: string;
  startTimestamp?: number; // unix timestamp
  endTimestamp?: number;
  flagValue: FeatureFlag['valueType']; // the intervention is defined here, by a specific flag value	
}

// a grouping of users to be subjected to a sequence of experiment blocks
export interface ExperimentGroup {
  id: string;
  name: string;
  proportion: number; // default 1 for switchbacks
  blocks: ExperimentBlock[];
  gap: number; // tentative - a time gap between blocks to mitigate across-block effects
}


export interface Experiment extends OverrideRule {
  name: string; // unique experiment name
  groups: ExperimentGroup[];
  flagId: string;
  dependents: EventTelemetry[]; // all dependent variables
}