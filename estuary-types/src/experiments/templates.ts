import { ExperimentDraft } from "./classes.js";
import {
  TreatmentTemplate,
  ExperimentGroup,
  ExperimentGroupTemplate,
  EnrollmentTemplate,
} from "./child-classes.js";
import { RequireOnly, idMap } from '../helpers/index.js';

/**
 * Uses defaults where possible to make a bare-bones ExperimentDraft
 */

export class ExperimentDraftTemplate extends ExperimentDraft {
  constructor(partialDraft: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>) {

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

    super({ ...defaults, ...partialDraft });
  }
}
/**
 * Creates an experiment with one group and two treatments
 * in a sequence, executed twice
 */

export class SwitchbackTemplate extends ExperimentDraft {
  constructor(partialSwitchback: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>) {

    const treatments = [
      new TreatmentTemplate({ name: 'Control'}),
      new TreatmentTemplate({ name: 'Experimental'}),
    ];

    const group = new ExperimentGroupTemplate({
      name: 'Experimental',
      proportion: 1,
      sequence: [],
      cycles: 2,
    });

    const defaults = {
      description: null,
      hypothesis: null,
      status: 'draft' as const,
      startTimestamp: null,
      endTimestamp: null,
      groups: [group],
      enrollment: { attributes: [], proportion: 0 },
      flagIds: [],
      dependents: [],
      definedTreatments: idMap(treatments),
    };

    super({ ...defaults, ...partialSwitchback });
  }
}

/**
 * Creates an experiment with two groups and one treatment assigned to each
 */
export class ABExperimentTemplate extends ExperimentDraft {
  constructor(partialABExperiment: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>) {

    const treatments = [
      new TreatmentTemplate({ name: 'Control'}),
      new TreatmentTemplate({ name: 'Experimental'}),
    ];

    const groups = [
      new ExperimentGroupTemplate({ name: 'Group 1' }),
      new ExperimentGroupTemplate({ name: 'Group 2' }),
    ];

    const defaults = {
      description: null,
      hypothesis: null,
      startTimestamp: null,
      endTimestamp: null,
      status: 'draft' as const,
      groups,
      enrollment: { attributes: [], proportion: 0 },
      flagIds: [],
      dependents: [],
      definedTreatments: idMap(treatments),
    };

    super({ ...defaults, ...partialABExperiment });
  }
}
