import { z } from 'zod';
import {
  Condition,
  ConditionReference,
  FlagState,
  experimentDraftSchema,
} from './schema.js';
import {
  Enrollment,
  ExperimentGroup,
  Hypothesis,
  Metric,
  Treatment,
} from './child-classes.js';
import {
  Experiment,
  FeatureFlag,
  experimentSchema,
} from '../shared/imputed.js';
import { RuleStatus } from '../override-rules/override-rules.schema.js';
import { RequireOnly } from '../helpers/utility-types.js';
import { idMap } from '../helpers/utility-functions.js';
import { FeatureFlagDraft } from '../feature-flags/classes.js';

/**
 * Creates a full ExperimentDraft
 */
export class ExperimentDraft implements z.infer<typeof experimentDraftSchema> {
  name: string;

  environmentName: string;

  status: RuleStatus;

  type: 'Experiment';

  description: string | null;

  hypothesis: string | null;

  startTimestamp: number | null;

  endTimestamp: number | null;

  groups: ExperimentGroup[];

  enrollment: Enrollment;

  flagIds: string[];

  definedTreatments: Record<string, Treatment>;

  dependents: Metric[];

  hypotheses: Hypothesis[];

  constructor(experimentDraft: Omit<ExperimentDraft, 'type'>) {
    this.name = experimentDraft.name;
    this.environmentName = experimentDraft.environmentName;
    this.status = experimentDraft.status;
    this.description = experimentDraft.description;
    this.hypothesis = experimentDraft.hypothesis;
    this.startTimestamp = experimentDraft.startTimestamp;
    this.endTimestamp = experimentDraft.endTimestamp;
    this.groups = experimentDraft.groups;
    this.enrollment = experimentDraft.enrollment;
    this.flagIds = experimentDraft.flagIds;
    this.dependents = experimentDraft.dependents;
    this.definedTreatments = experimentDraft.definedTreatments;
    this.hypotheses = experimentDraft.hypotheses;

    this.type = 'Experiment';
  }

  // #region Helper methods for working with ExperimentDrafts and Experiments
  static isExperiment(arg: unknown): arg is Experiment {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success;
  }

  static parsedExperiment<I>(arg: I) {
    const safeParseResult = experimentSchema.safeParse(arg);
    return safeParseResult.success
      ? safeParseResult.data
      : safeParseResult.error;
  }

  /**
   * Returns true if an experiment has all of the following:
   * - at least one feature flag
   * - no feature flags disabled in its environment
   * - either:
   *   - at least one group with two treatments
   *   - at least two groups with one treatment each
   *
   * Returns false otherwise.
   */
  static isReadyToStart(
    experiment: ExperimentDraft,
    flags: FeatureFlag[],
  ): boolean {
    if (experiment.hypotheses.length === 0) return false;
    if (experiment.flagIds.length === 0) return false;

    const expFlagIdSet = new Set(experiment.flagIds);
    const experimentFlags = flags.filter((flag) => expFlagIdSet.has(flag.id));
    if (experimentFlags.length !== experiment.flagIds.length) return false;

    if (
      !experimentFlags.every(
        (flag) => experiment.environmentName in flag.environmentNames,
      )
    ) return false;

    const groupCount = experiment.groups.length;
    if (groupCount === 0) return false;
    if (groupCount === 1) {
      return experiment.groups[0].sequence.length >= 2;
    }

    return experiment.groups.every((group) => group.sequence.length >= 1);
  }

  static getGroupTreatments(
    experiment: ExperimentDraft,
    groupId: string,
  ): Treatment[] | null {
    const matchingGroup = experiment.groups.find(
      (group) => group.id === groupId,
    );
    if (!matchingGroup) return null;

    return matchingGroup.sequence.map(
      (treatmentId) => experiment.definedTreatments[treatmentId],
    );
  }

  static getAllExperimentConditions(experiment: ExperimentDraft): Condition[] {
    return experiment.groups.reduce((acc: Condition[], group) => {
      const groupConditions: Condition[] = group.sequence.map((treatmentId) => {
        const treatment = experiment.definedTreatments[treatmentId];
        return [group, treatment];
      });

      return [...acc, ...groupConditions];
    }, []);
  }

  /**
   * @param conditionRef a tuple [groupId, treatmentId]
   * @returns the group and treatment referenced, or `null` if the IDs
   * are invalid
   */
  static getConditionFromRef(
    experiment: ExperimentDraft,
    conditionRef: ConditionReference,
  ): [ExperimentGroup, Treatment] | null {
    const [targetGroupId, targetTreatmentId] = conditionRef;
    const targetGroup = experiment.groups.find(
      (group) => group.id === targetGroupId,
    );
    if (!targetGroup) return null;

    const groupTreatments = ExperimentDraft.getGroupTreatments(
      experiment,
      targetGroupId,
    );

    if (!groupTreatments) return null;

    const targetTreatment = groupTreatments.find(
      (treatment) => treatment.id === targetTreatmentId,
    );

    if (!targetTreatment) return null;

    return [targetGroup, targetTreatment];
  }

  /**
   * Mutates the passed Experiment, adding a FlagState to each Treatment.
   * Uses the flag's default value.
   */
  static addFlag(experiment: ExperimentDraft, flag: FeatureFlag) {
    if (experiment.flagIds.includes(flag.id)) {
      throw new Error(
        `Flag "${flag.name}" already exists on experiment "${experiment.name}"`,
      );
    }

    const flagState: FlagState = {
      id: flag.id,
      value: flag.value.initial,
    };

    experiment.flagIds.push(flag.id);

    const { definedTreatments } = experiment;

    Object.keys(definedTreatments).forEach((treatment) => {
      definedTreatments[treatment].flagStates.push(flagState);
    });

    return experiment;
  }

  /**
   * Returns a portion of an Experiment, removing all flag states and the
   * reference for the specified flag ID. Non-mutating.
   */
  static removeFlag(
    experiment: ExperimentDraft,
    flagId: string,
  ): Pick<Experiment, 'flagIds' | 'definedTreatments'> {
    const flagIds = experiment.flagIds.filter((id) => id !== flagId);
    const treatmentArr = Object.entries(experiment.definedTreatments);
    const filteredTreatmentArr = treatmentArr.map(([id, treatment]) => [
      id,
      {
        ...treatment,
        flagStates: treatment.flagStates.filter((state) => state.id !== flagId),
      },
    ]);
    const definedTreatments = Object.fromEntries(filteredTreatmentArr);
    return {
      flagIds,
      definedTreatments,
    };
  }

  static addTreatment(
    experiment: ExperimentDraft,
    flags: FeatureFlag[],
    treatmentName: string,
  ) {
    const flagStates = FeatureFlagDraft.getDefaultFlagStates(flags);
    const treatment = Treatment.template({
      name: treatmentName,
      flagStates,
    });
    const { definedTreatments } = experiment;
    definedTreatments[treatment.id] = treatment;
  }

  static addGroup(experiment: ExperimentDraft) {
    const groupNamePrefix = 'New Group';
    const groupNames = new Set(experiment.groups.map((group) => group.name));
    let counter = 1;
    let newGroupName = `${groupNamePrefix} ${counter}`;
    while (groupNames.has(newGroupName)) {
      counter += 1;
      newGroupName = `${groupNamePrefix} ${counter}`;
    }

    const newGroup = ExperimentGroup.template({
      name: newGroupName,
    });

    experiment.groups.push(newGroup);
  }
  // #endregion

  // #region Templates
  static template(
    partialDraft: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>,
  ) {
    const defaults = {
      status: 'draft' as const,
      description: null,
      hypothesis: null,
      startTimestamp: null,
      endTimestamp: null,
      groups: [],
      enrollment: Enrollment.template(),
      flagIds: [],
      definedTreatments: {},
      dependents: [],
      hypotheses: [],
    };

    return new ExperimentDraft({ ...defaults, ...partialDraft });
  }

  static templateSwitchback(
    partialSwitchback: RequireOnly<ExperimentDraft, 'name' | 'environmentName'>,
  ) {
    const treatments = [
      Treatment.template({ name: 'Control' }),
      Treatment.template({ name: 'Experimental' }),
    ];

    const group = ExperimentGroup.template({
      name: 'Experimental',
      proportion: 1,
      sequence: treatments.map((el) => el.id),
      cycles: 2,
    });

    const defaults = {
      groups: [group],
      definedTreatments: idMap(treatments),
    };

    return this.template({ ...defaults, ...partialSwitchback });
  }

  static templateAB(
    partialABExperiment: RequireOnly<
    ExperimentDraft,
    'name' | 'environmentName'
    >,
  ) {
    const treatments = [
      Treatment.template({ name: 'Control' }),
      Treatment.template({ name: 'Experimental' }),
    ];

    const groups = [
      ExperimentGroup.template({
        name: 'Control Group',
        proportion: 0.5,
        sequence: [treatments[0].id],
      }),
      ExperimentGroup.template({
        name: 'Experimental Group',
        proportion: 0.5,
        sequence: [treatments[1].id],
      }),
    ];

    const defaults = {
      groups,
      definedTreatments: idMap(treatments),
    };

    return this.template({ ...defaults, ...partialABExperiment });
  }
  // #endregion
}
