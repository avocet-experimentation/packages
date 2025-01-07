import { z } from 'zod';
import {
  FlagState,
  experimentGroupSchema,
  treatmentSchema,
  experimentReferenceSchema,
  metricSchema,
  Condition,
  hypothesisSchema,
} from './schema.js';
import {
  enrollmentSchema,
  RuleStatus,
} from '../override-rules/override-rules.schema.js';
import { RequireOnly } from '../helpers/utility-types.js';
import { PrimitiveTypeLabel } from '../helpers/bounded-primitives.js';

export class Metric implements z.infer<typeof metricSchema> {
  fieldName: string;

  type: PrimitiveTypeLabel;

  constructor(obj: Metric) {
    this.fieldName = obj.fieldName;
    this.type = obj.type;
  }

  static template(partialDraft: Partial<Metric>) {
    const defaults = {
      fieldName: '',
      type: 'number' as const,
    };

    return new Metric({ ...defaults, ...partialDraft });
  }
}
/**
 * A formal hypothesis definition
 */
export class Hypothesis implements z.infer<typeof hypothesisSchema> {
  id: string;

  dependentName: string;

  analysis: string;

  compareValue: string | number | boolean;

  compareOperator: string;

  baseCondition: Condition;

  testCondition: Condition;

  constructor(hypothesis: Hypothesis) {
    this.id = hypothesis.id;
    this.dependentName = hypothesis.dependentName;
    this.analysis = hypothesis.analysis;
    this.compareValue = hypothesis.compareValue;
    this.compareOperator = hypothesis.compareOperator;
    this.baseCondition = hypothesis.baseCondition;
    this.testCondition = hypothesis.testCondition;
  }

  static template(
    partial: RequireOnly<
    Hypothesis,
    'dependentName' | 'baseCondition' | 'testCondition' | 'analysis'
    >,
  ) {
    const defaults = {
      id: crypto.randomUUID(),
      compareValue: 0,
      compareOperator: '=',
    };

    return new Hypothesis({ ...defaults, ...partial });
  }
}

export class Enrollment implements z.infer<typeof enrollmentSchema> {
  attributes: string[];

  proportion: number;

  constructor(enrollment: Enrollment) {
    this.attributes = enrollment.attributes;
    this.proportion = enrollment.proportion;
  }

  static template(partialEnrollment?: Partial<Enrollment>) {
    const defaults = {
      attributes: [],
      proportion: 0,
    };

    return new Enrollment({ ...defaults, ...partialEnrollment });
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

  static template(partialTreatment: RequireOnly<Treatment, 'name'>) {
    const defaults = {
      id: crypto.randomUUID(),
      duration: 0,
      flagStates: [],
    };

    return new Treatment({ ...defaults, ...partialTreatment });
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

  static template(partialGroup: RequireOnly<ExperimentGroup, 'name'>) {
    const defaults = {
      id: crypto.randomUUID(),
      description: null,
      proportion: 0,
      sequence: [],
      cycles: 1,
    };

    return new ExperimentGroup({ ...defaults, ...partialGroup });
  }
}

/**
 * Given an Experiment, create a reference object to embed into a feature flag
 */
export class ExperimentReference
implements z.infer<typeof experimentReferenceSchema> {
  id: string;

  name: string;

  description: string | null;

  type: 'Experiment';

  status: RuleStatus;

  environmentName: string;

  startTimestamp: number | null;

  endTimestamp: number | null;

  enrollment: Enrollment;

  constructor(experimentReference: Omit<ExperimentReference, 'type'>) {
    this.id = experimentReference.id;
    this.name = experimentReference.name;
    this.description = experimentReference.description;
    this.type = 'Experiment';
    this.status = experimentReference.status;
    this.environmentName = experimentReference.environmentName;
    this.startTimestamp = experimentReference.startTimestamp;
    this.endTimestamp = experimentReference.endTimestamp;
    this.enrollment = experimentReference.enrollment;
  }

  static template(
    partialExpRef: RequireOnly<
    ExperimentReference,
    'id' | 'name' | 'environmentName'
    >,
  ) {
    const defaults = {
      status: 'draft' as const,
      description: null,
      startTimestamp: null,
      endTimestamp: null,
      enrollment: Enrollment.template(),
    };

    return new ExperimentReference({ ...defaults, ...partialExpRef });
  }
}
