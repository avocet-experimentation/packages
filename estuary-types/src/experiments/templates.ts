import { ExperimentDraft } from "./classes.js";
import { EnvironmentName } from "../environments/schema.js";
import {
  TreatmentTemplate,
  ExperimentGroup,
  ExperimentGroupTemplate,
} from "./child-classes.js";
import { idMap } from '../helpers/index.js';


type ExperimentDraftDefaults = Pick<ExperimentDraft, 'groups' |
  'enrollment' |
  'flagIds' |
  'dependents' |
  'definedTreatments'
>;
/**
 * Uses defaults where possible to make a bare-bones ExperimentDraft
 */

export class ExperimentDraftTemplate extends ExperimentDraft {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const defaults: ExperimentDraftDefaults = {
      groups: [],
      enrollment: {
        attributes: [],
        proportion: 0,
      },
      flagIds: [],
      dependents: [],
      definedTreatments: {},
    };
    super({ name, environmentName, status, ...defaults });
  }
}
/**
 * Creates an experiment with one group and two treatments
 * in a sequence, executed twice
 */

export class SwitchbackTemplate extends ExperimentDraft {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const treatments = [
      new TreatmentTemplate('Control'),
      new TreatmentTemplate('Experimental'),
    ];

    const group = new ExperimentGroup({
      name: 'Experimental',
      proportion: 1,
      sequence: [],
      cycles: 2,
    });

    const defaults = {
      groups: [group],
      enrollment: { attributes: [], proportion: 0 },
      flagIds: [],
      dependents: [],
      definedTreatments: idMap(treatments),
    };

    super({ name, environmentName, status, ...defaults });
  }
}

/**
 * Creates an experiment with two groups and one treatment assigned to each
 */
export class ABExperimentTemplate extends ExperimentDraft {
  constructor(name: string, environmentName: EnvironmentName) {
    const status = 'draft';

    const treatments = [
      new TreatmentTemplate('Control'),
      new TreatmentTemplate('Experimental'),
    ];

    const groups = [
      new ExperimentGroupTemplate('Group 1'),
      new ExperimentGroupTemplate('Group 2'),
    ];

    const defaults = {
      groups,
      enrollment: { attributes: [], proportion: 0 },
      flagIds: [],
      dependents: [],
      definedTreatments: idMap(treatments),
    };

    super({ name, environmentName, status, ...defaults });
  }
}
