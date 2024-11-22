import { z } from "zod";
import {
  FlagState,
  experimentGroupSchema,
  treatmentSchema,
  experimentReferenceSchema,
} from "./schema.js";
import { enrollmentSchema, RuleStatus } from "../override-rules/override-rules.schema.js";
import { RequireOnly } from "../helpers/utility-types.js";

export class Enrollment implements z.infer<typeof enrollmentSchema> {
  attributes: string[];
  proportion: number;

  constructor(enrollment: Enrollment) {
    this.attributes = enrollment.attributes;
    this.proportion = enrollment.proportion;
  }
}

export class EnrollmentTemplate extends Enrollment {
  constructor(partialEnrollment?: Partial<Enrollment>) {
    const defaults = {
      attributes: [],
      proportion: 0,
    };

    super({ ...defaults, ...partialEnrollment });
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

  constructor(treatment: Treatment) {
    this.id = treatment.id;
    this.name = treatment.name;
    this.duration = treatment.duration;
    this.flagStates = treatment.flagStates;
  }
}

export class TreatmentTemplate extends Treatment {
  constructor(partialTreatment: RequireOnly<Treatment, 'name'>) {
    const defaults = {
      id: crypto.randomUUID(),
      duration: 0,
      flagStates: [],
    };
    super({ ...defaults, ...partialTreatment });
  }
}

/**
 * a grouping of users who will receive the same sequences of experiment treatments
 */
export class ExperimentGroup implements z.infer<typeof experimentGroupSchema> {
  id: string;
  name: string;
  description: string | null;
  proportion: number;
  sequence: string[];
  cycles: number;

  constructor(group: ExperimentGroup) {
    this.id = group.id;
    this.name = group.name;
    this.description = group.description;
    this.proportion = group.proportion;
    this.sequence = group.sequence;
    this.cycles = group.cycles;
  }
}

export class ExperimentGroupTemplate extends ExperimentGroup {
  constructor(partialGroup: RequireOnly<ExperimentGroup, 'name'>) {

    const defaults = {
      id: crypto.randomUUID(),
      description: null,
      proportion: 0,
      sequence: [],
      cycles: 1,
    };

    super({ ...defaults, ...partialGroup });
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
  startTimestamp: number | null;
  endTimestamp: number | null;
  enrollment: Enrollment;

  constructor(experimentReference: Omit<ExperimentReference, 'type'>) {
    this.id = experimentReference.id;
    this.name = experimentReference.name;
    this.type = 'ExperimentReference';
    this.status = experimentReference.status;
    this.environmentName = experimentReference.environmentName;
    this.startTimestamp = experimentReference.startTimestamp;
    this.endTimestamp = experimentReference.endTimestamp;
    this.enrollment = experimentReference.enrollment;
  }
}

export class ExperimentReferenceTemplate extends ExperimentReference {
  constructor(partialExpRef: RequireOnly<ExperimentReference, 'id' | 'name' | 'environmentName'>) {
    const defaults = {
      status: 'draft' as const,
      description: null,
      startTimestamp: null,
      endTimestamp: null,
      enrollment: new EnrollmentTemplate(),
    }

    super({ ...defaults, ...partialExpRef });
  }
}