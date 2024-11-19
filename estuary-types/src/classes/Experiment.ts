import { SafeParseError, SafeParseReturnType, ZodError, z } from "zod";
import { EnvironmentName } from "../environments.js";
import {
  ExperimentDraft,
  ExperimentGroup,
  Treatment,
  TreatmentSequence,
  experimentDraftSchema,
} from "../experiments.js";
import { Experiment, experimentSchema } from "../imputed.js";
import { Metric } from "../metrics.js";
import { RuleStatus, Enrollment } from "../overrideRules.js";

/**
 * Creates a full ExperimentDraft
 */
export class ExperimentDraftImpl implements z.infer<typeof experimentDraftSchema> {
  name: string;
  environmentName: EnvironmentName;
  status: RuleStatus;
  type: 'Experiment';
  groups: ExperimentGroup[];
  enrollment: Enrollment;
  dependents: Metric[];
  definedTreatments: Treatment[];
  definedSequences: TreatmentSequence[];

  constructor({
    name,
    environmentName,
    status,
    groups,
    enrollment,
    dependents,
    definedTreatments,
    definedSequences,
  }: Omit<ExperimentDraft, 'type'>) {
    this.name = name;
    this.environmentName = environmentName;
    this.status = status;
    this.groups = groups;
    this.enrollment = enrollment;
    this.dependents = dependents;
    this.definedTreatments = definedTreatments;
    this.definedSequences = definedSequences;

    this.type = 'Experiment';
  }

  static isExperiment(arg: unknown): arg is Experiment {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success;
  }

  static parsedExperiment<I>(arg: I) {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success ? safeParseResult.data : safeParseResult.error;
  }

  /**
   * Get an array of all the flags set by any of an Experiment's treatments
   */
  getFlagIds() {
    // get all treatments
    // get flag states for each treatment
    // get a set of all unique flag IDs and return it
    const flagIds = new Set<string>();
    this.definedTreatments.forEach((treatment) => {
      treatment.flagStates.forEach((flagState) => {
        flagIds.add(flagState.id);
      });
    });

    return [...flagIds];
  }
}

export class ExperimentImpl extends ExperimentDraftImpl implements Experiment {
  id: string;
  createdAt: number;
  updatedAt: number;

  constructor(experiment: Experiment) {
    super(experiment);
    this.id = experiment.id;
    this.createdAt = experiment.createdAt;
    this.updatedAt = experiment.updatedAt;
  }
}