import { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { EnvironmentName } from "../environments.js";
import {
  ExperimentDraft,
  ExperimentGroup,
  Treatment,
  TreatmentSequence,
} from "../experiments.js";
import { Experiment, experimentSchema } from "../imputed.js";
import { Metric } from "../metrics.js";
import { RuleStatus, Enrollment } from "../overrideRules.js";

/**
 * Creates a full ExperimentDraft
 */
export class ExperimentDraftImpl implements ExperimentDraft {
  name: string;
  environment: EnvironmentName;
  status: RuleStatus;
  type: 'Experiment';
  groups: ExperimentGroup[];
  enrollment: Enrollment;
  dependents: Metric[];
  definedTreatments: Treatment[];
  definedSequences: TreatmentSequence[];

  constructor({
    name,
    environment,
    status,
    groups,
    enrollment,
    dependents,
    definedTreatments,
    definedSequences,
  }: Omit<ExperimentDraft, 'type'>) {
    this.name = name;
    this.environment = environment;
    this.status = status;
    this.groups = groups;
    this.enrollment = enrollment;
    this.dependents = dependents;
    this.definedTreatments = definedTreatments;
    this.definedSequences = definedSequences;

    this.type = 'Experiment';
  }

  isExperiment(arg: unknown): arg is Experiment {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success;
  }

  parsedExperiment<I>(arg: I) {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success ? safeParseResult.data : safeParseResult.error;
  }
}