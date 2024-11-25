import { z } from "zod";
import {
  experimentDraftSchema,
} from "./schema.js";
import { Metric } from "../metrics/schema.js";
import {
  Enrollment,
  EnrollmentTemplate,
  ExperimentGroup,
  Treatment,
} from "./child-classes.js";
import { Experiment, experimentSchema } from "../shared/imputed.js";
import { RuleStatus } from "../override-rules/override-rules.schema.js";
import { RequireOnly } from "../helpers/utility-types.js";

/**
 * Creates a full ExperimentDraft
 */
export class ExperimentDraft implements z.infer<typeof experimentDraftSchema> {
  name: string;
  environmentName: string;
  status: RuleStatus;
  type: 'Experiment';
  description: string | null;
  hypothesis: string | null;
  startTimestamp: number | null;
  endTimestamp: number | null;
  groups: ExperimentGroup[];
  enrollment: Enrollment;
  flagIds: string[];
  dependents: Metric[];
  definedTreatments: Record<string,Treatment>;

  constructor(experimentDraft: Omit<ExperimentDraft, 'type'>) {
    this.name = experimentDraft.name;
    this.environmentName = experimentDraft.environmentName;
    this.status = experimentDraft.status;
    this.description = experimentDraft.description;
    this.hypothesis = experimentDraft.hypothesis;
    this.startTimestamp = experimentDraft.startTimestamp;
    this.endTimestamp = experimentDraft.endTimestamp;
    this.groups = experimentDraft.groups;
    this.enrollment = experimentDraft.enrollment;
    this.flagIds = experimentDraft.flagIds;
    this.dependents = experimentDraft.dependents;
    this.definedTreatments = experimentDraft.definedTreatments;

    this.type = 'Experiment';
  }

  // #region Helper methods for working with ExperimentDrafts and Experiments
  static isExperiment(arg: unknown): arg is Experiment {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success;
  }

  static parsedExperiment<I>(arg: I) {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success ? safeParseResult.data : safeParseResult.error;
  }

  static groupTreatments(experiment: ExperimentDraft | Experiment, groupId: string): Treatment[] | null {
    const group = experiment.groups.find((group) => group.id === groupId);
    if (!group) return null;

    return group.sequence.map((treatmentId) => experiment.definedTreatments[treatmentId]);
  }
  // #endregion

  // #region Templates
  static template(partialDraft: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>) {

    const defaults = {
      status: 'draft' as const,
      description: null,
      hypothesis: null,
      startTimestamp: null,
      endTimestamp: null,
      groups: [],
      enrollment: new EnrollmentTemplate(),
      flagIds: [],
      dependents: [],
      definedTreatments: {},
    };

    return new ExperimentDraft({ ...defaults, ...partialDraft });
  }

  // #endregion
}