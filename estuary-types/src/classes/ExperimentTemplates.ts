import { ExperimentDraftImpl } from "./Experiment.js";

import { EnvironmentName } from "../environments.js";
import { ExperimentDraft } from "../experiments.js";
import { TreatmentTemplate, TreatmentSequenceImpl, ExperimentGroupImpl, ExperimentGroupTemplate } from "./ExperimentSubclasses.js";


type ExperimentDraftDefaults = Pick<ExperimentDraft, 'groups' |
  'enrollment' |
  'dependents' |
  'definedTreatments' |
  'definedSequences'
>;
/**
 * Uses defaults where possible to make a bare-bones ExperimentDraft
 */

export class ExperimentDraftTemplate extends ExperimentDraftImpl {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const defaults: ExperimentDraftDefaults = {
      groups: [],
      enrollment: {
        attributes: [],
        proportion: 0,
      },
      dependents: [],
      definedTreatments: [],
      definedSequences: [],
    };
    super({ name, environmentName, status, ...defaults });
  }
}
/**
 * Creates an experiment with one group and two treatments
 * in a sequence, executed twice
 */

export class SwitchbackTemplate extends ExperimentDraftImpl {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const treatments = [
      new TreatmentTemplate('Control'),
      new TreatmentTemplate('Experimental'),
    ];

    const sequence = new TreatmentSequenceImpl({
      treatmentIds: treatments.map((el) => el.id),
    });

    const group = new ExperimentGroupImpl({
      name: 'Experimental',
      proportion: 1,
      sequenceId: sequence.id,
      cycles: 2,
    });

    const defaults = {
      groups: [group],
      enrollment: { attributes: [], proportion: 0 },
      dependents: [],
      definedTreatments: [...treatments],
      definedSequences: [sequence],
    };

    super({ name, environmentName, status, ...defaults });
  }
}
;
/**
 * Creates an experiment with two groups and one treatment assigned to each
 */
export class ABExperimentTemplate extends ExperimentDraftImpl {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const treatments = [
      new TreatmentTemplate('Control'),
      new TreatmentTemplate('Experimental'),
    ];

    const sequences = [
      new TreatmentSequenceImpl({ treatmentIds: [treatments[0].id] }),
      new TreatmentSequenceImpl({ treatmentIds: [treatments[1].id] }),
    ];

    const groups = [
      new ExperimentGroupTemplate('Group 1', sequences[0].id),
      new ExperimentGroupTemplate('Group 2', sequences[1].id),
    ];

    const defaults = {
      groups,
      enrollment: { attributes: [], proportion: 0 },
      dependents: [],
      definedTreatments: [...treatments],
      definedSequences: [...sequences],
    };

    super({ name, environmentName, status, ...defaults });
  }
}
