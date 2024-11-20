import { SafeParseError, SafeParseReturnType, ZodError, z } from "zod";
import { EnvironmentName } from "../environments.js";
import {
  experimentDraftSchema,
} from "../experiments.js";
import { Metric } from "../metrics.js";
import { RuleStatus } from "../overrideRules.js";
import { Enrollment, ExperimentGroup, Treatment } from "./ExperimentSubclasses.js";
import { Experiment, experimentSchema } from "../imputed.js";

/**
 * Creates a full ExperimentDraft
 */
export class ExperimentDraft implements z.infer<typeof experimentDraftSchema> {
  name: string;
  environmentName: EnvironmentName;
  status: RuleStatus;
  type: 'Experiment';
  groups: ExperimentGroup[];
  enrollment: Enrollment;
  flagIds: string[];
  dependents: Metric[];
  definedTreatments: Record<string,Treatment>;

  constructor(draft: Omit<ExperimentDraft, 'type'>) {
    this.name = draft.name;
    this.environmentName = draft.environmentName;
    this.status = draft.status;
    this.groups = draft.groups;
    this.enrollment = draft.enrollment;
    this.flagIds = draft.flagIds;
    this.dependents = draft.dependents;
    this.definedTreatments = draft.definedTreatments;
    // this.definedSequences = definedSequences;

    this.type = 'Experiment';
  }

  /* Helper methods for working with ExperimentDrafts and Experiments */
  static isExperiment(arg: unknown): arg is Experiment {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success;
  }

  static parsedExperiment<I>(arg: I) {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success ? safeParseResult.data : safeParseResult.error;
  }
}