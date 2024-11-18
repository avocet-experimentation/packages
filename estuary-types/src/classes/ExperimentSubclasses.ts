import {
  Treatment,
  FlagState,
  TreatmentSequence,
  ExperimentGroup,
} from "../experiments.js";


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
