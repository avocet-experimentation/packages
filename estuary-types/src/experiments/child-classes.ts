import { z } from "zod";
import {
  FlagState,
  experimentGroupSchema,
  treatmentSchema,
  experimentReferenceSchema,
} from "./schema.js";
import { enrollmentSchema, RuleStatus } from "../override-rules/override-rules.schema.js";
import { Experiment } from "../shared/imputed.js";

export class Enrollment implements z.infer<typeof enrollmentSchema> {
  attributes: string[];
  proportion: number;

  constructor({ attributes, proportion }: Enrollment) {
    this.attributes = attributes;
    this.proportion = proportion;
  }
}

export class EnrollmentTemplate extends Enrollment {
  constructor() {
    const defaults = {
      attributes: [],
      proportion: 0,
    };

    super(defaults);
  }
}

/**
 * A time interval in which a specific combination of flag states is to be applied to subjects
 */
export class Treatment implements z.infer<typeof treatmentSchema> {
  id: string;
  name: string;
  duration: number;
  flagStates: FlagState[];

  constructor({
    name, duration, flagStates,
  }: Omit<Treatment, 'id'>) {
    this.id = crypto.randomUUID(),

    this.name = name;
    this.duration = duration;
    this.flagStates = flagStates;
  }
}

export class TreatmentTemplate extends Treatment {
  constructor(name: string) {
    const defaults = {
      duration: 0,
      flagStates: [],
    };
    super({ name, ...defaults });
  }
}

/**
 * a grouping of users who will receive the same sequences of experiment treatments
 */
export class ExperimentGroup implements z.infer<typeof experimentGroupSchema> {
  id: string;
  name: string;
  proportion: number;
  sequence: string[];
  cycles: number;

  constructor({
    name, proportion, sequence, cycles,
  }: Omit<ExperimentGroup, 'id'>) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.proportion = proportion;
    this.sequence = sequence;
    this.cycles = cycles;
  }
}

export class ExperimentGroupTemplate extends ExperimentGroup {
  constructor(name: string) {

    const defaults = {
      proportion: 0,
      sequence: [],
      cycles: 1,
    };

    super({ name, ...defaults });
  }
}

/**
 * Given an Experiment, create a reference object to embed into a feature flag
 */
export class ExperimentReference implements z.infer<typeof experimentReferenceSchema> {
  id: string;
  name: string;
  type: 'ExperimentReference';
  status: RuleStatus;
  environmentName: string;
  startTimestamp?: number;
  endTimestamp?: number;
  enrollment: Enrollment;

  constructor(experiment: Omit<ExperimentReference, 'type'>) {
    this.id = experiment.id;
    this.name = experiment.name;
    this.type = 'ExperimentReference';
    this.status = experiment.status;
    this.environmentName = experiment.environmentName;
    this.startTimestamp = experiment.startTimestamp;
    this.endTimestamp = experiment.endTimestamp;
    this.enrollment = experiment.enrollment;
  }
}

export class ExperimentReferenceTemplate extends ExperimentReference {
  constructor(experimentId: string, experimentName: string, environmentName: string) {
    const defaults = {
      status: 'draft' as const,
      enrollment: new EnrollmentTemplate(),
    }

    super({
      id: experimentId,
      name: experimentName,
      environmentName,
      ...defaults,
    });
  }
}