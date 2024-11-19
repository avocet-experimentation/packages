import { EnvironmentName } from "../environments.js";
import {
  Treatment,
  FlagState,
  TreatmentSequence,
  ExperimentGroup,
  ExperimentReference,
} from "../experiments.js";
import { Enrollment, RuleStatus } from "../overrideRules.js";

export class EnrollmentImpl implements Enrollment {
  attributes: string[];
  proportion: number;

  constructor({ attributes, proportion }: Enrollment) {
    this.attributes = attributes;
    this.proportion = proportion;
  }
}

export class EnrollmentTemplate extends EnrollmentImpl {
  constructor() {
    const defaults = {
      attributes: [],
      proportion: 0,
    };

    super(defaults);
  }
}

export class TreatmentImpl implements Treatment {
  id: string;
  name: string;
  duration: number;
  flagStates: FlagState[];

  constructor({
    name, duration, flagStates,
  }: Omit<Treatment, 'id'>) {
    this.id = self.crypto.randomUUID();

    this.name = name;
    this.duration = duration;
    this.flagStates = flagStates;
  }
}

export class TreatmentTemplate extends TreatmentImpl {
  constructor(name: string) {
    const defaults = {
      duration: 0,
      flagStates: [],
    };
    super({ name, ...defaults });
  }
}

export class TreatmentSequenceImpl implements TreatmentSequence {
  id: string;
  treatmentIds: string[];

  constructor({ treatmentIds }: Omit<TreatmentSequence, 'id'>) {
    this.id = self.crypto.randomUUID();
    this.treatmentIds = treatmentIds;
  }
}

export class ExperimentGroupImpl implements ExperimentGroup {
  id: string;
  name: string;
  proportion: number;
  sequenceId?: string;
  cycles: number;

  constructor({
    name, proportion, sequenceId, cycles,
  }: Omit<ExperimentGroup, 'id'>) {
    this.id = self.crypto.randomUUID();
    this.name = name;
    this.proportion = proportion;
    this.sequenceId = sequenceId;
    this.cycles = cycles;
  }
}

export class ExperimentGroupTemplate extends ExperimentGroupImpl {
  constructor(name: string, sequenceId?: string) {

    const defaults = {
      proportion: 0,
      cycles: 1,
    };

    super({ name, sequenceId, ...defaults });
  }
}

/**
 * Given an Experiment, create a reference object to embed into a
 * feature flag
 */
export class ExperimentReferenceImpl implements ExperimentReference {
  id: string;
  name: string;
  type: 'ExperimentReference';
  status: RuleStatus;
  environmentName: EnvironmentName;
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

export class ExperimentReferenceTemplate extends ExperimentReferenceImpl {
  constructor(experimentId: string, environmentName: EnvironmentName) {
    const defaults = {
      name: '',
      status: 'draft' as const,
      enrollment: new EnrollmentTemplate(),
    }

    super({ id: experimentId, environmentName, ...defaults });
  }
}