import { EnvironmentName } from "../environments.js";
import {
  ExperimentDraft,
  ExperimentGroup,
  Treatment,
  TreatmentSequence,
} from "../experiments.js";
import { Metric } from "../metrics.js";
import { RuleStatus, Enrollment } from "../overrideRules.js";
import {
  ExperimentGroupImpl,
  ExperimentGroupTemplate,
  TreatmentSequenceImpl,
  TreatmentTemplate,
} from "./ExperimentSubclasses.js";

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
}

type ExperimentDraftDefaults = Pick<ExperimentDraft,
    'groups' |
    'enrollment' | 
    'dependents' |
    'definedTreatments' |
    'definedSequences'
  >;

/**
 * Uses defaults where possible to make a bare-bones ExperimentDraft
 */
export class ExperimentDraftTemplate extends ExperimentDraftImpl {
  constructor(name: string, environment: EnvironmentName) {
    const status = 'draft';

    const defaults: ExperimentDraftDefaults = {
      groups: [],
      enrollment: {
        attributes: [],
        proportion: 0,
      },
      dependents:  [],
      definedTreatments:  [],
      definedSequences:  [],
    };
    super({name, environment, status, ...defaults});
  }
}

/**
 * Creates an experiment with one group and two treatments
 * in a sequence, executed twice
 */
export class SwitchbackTemplate extends ExperimentDraftImpl {
  constructor(name: string, environment: EnvironmentName) {
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

    super({ name, environment, status, ...defaults });
  }
};
/**
 * Creates an experiment with two groups and one treatment assigned to each
 */
export class ABExperimentTemplate extends ExperimentDraftImpl {
  constructor(name: string, environment: EnvironmentName) {
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

    super({ name, environment, status, ...defaults });
  }
}
