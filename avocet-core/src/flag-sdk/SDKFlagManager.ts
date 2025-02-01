import { Hash } from '../helpers/hashing.js';
import { NonEmptyArray } from '../helpers/utility-types.js';
import { ForcedValue } from '../override-rules/classes.js';
import { OverrideRuleUnion } from '../override-rules/override-rule-union.schema.js';
import { Experiment } from '../shared/imputed.js';
import { ClientPropMapping, ClientPropValue } from './client-props.schema.js';
import { ClientSDKFlagValue } from './sdk-flag-values.schema.js';
import { Treatment, ExperimentGroup } from '../experiments/child-classes.js';

export class SDKFlagManager {
  static ruleValueAndMetadata(
    rule: ForcedValue | Experiment,
    flagId: string,
    identifiers: ClientPropMapping,
  ): ClientSDKFlagValue | null {
    if (rule.type === 'Experiment') {
      const result = this.getTreatmentAndIds(rule, identifiers);
      if (result === null) return null;
      const { treatment, metadata } = result;
      const match = treatment.flagStates.find(({ id }) => id === flagId);
      if (match === undefined) {
        const msg = [
          `Failed to find a flag state with id ${flagId} on treatment ${treatment.id}`,
          `The experiment ${rule.id} was stored on the flag!`,
        ];
        throw new Error(msg.join('. '));
      }

      return { value: match.value, metadata };
    }
    if (rule.type === 'ForcedValue') {
      return {
        value: rule.value,
        metadata: this.singleIdString(rule.id),
      };
    }
    throw new TypeError(
      `Rule type was not accounted for! ${JSON.stringify(rule)}`,
    );
  }

  /**
   * Attempt to enroll a client in one of the passed override rules, testing
   * enrollment one rule at a time in the order they were stored on the flag
   */
  static enroll(
    overrideRules: OverrideRuleUnion[],
    clientProps: ClientPropMapping,
  ): OverrideRuleUnion | undefined {
    return overrideRules.find((rule) => {
      if (!this.ruleInEffect(rule)) return false;

      const identifiers = this.getIdentifiers(rule, clientProps);
      return Hash.andCompare(identifiers, rule.enrollment.proportion);
    });
  }

  static defaultIdString() {
    return this.randomIds(3);
  }

  static singleIdString(id: string) {
    return `${id}+${this.randomIds(2)}`;
  }

  static randomIds(count: number) {
    const idArr = new Array(count).fill(null).map(() => crypto.randomUUID());
    return idArr.join('+');
  }

  static getTreatmentAndIds(
    experiment: Experiment,
    identifiers: ClientPropMapping,
  ): {
      treatment: Treatment;
      metadata: string;
    } | null {
    const group = this.getGroupAssignment(experiment, identifiers);
    const treatment = this.currentTreatment(experiment, group);
    if (!treatment) return null;

    const metadata = [experiment.id, group.id, treatment.id].join('+');
    return { treatment, metadata };
  }

  /**
   * Assigns a user to an experimental group
   */
  static getGroupAssignment(
    experiment: Experiment,
    clientProps: ClientPropMapping,
  ): ExperimentGroup {
    const { groups } = experiment;
    if (groups.length === 0) {
      throw new Error(
        `Attempted to assign to a group on experiment ${experiment.id}, but `
          + 'no groups exist!',
      );
    }
    const groupOptions = groups.map((group) => ({
      id: group.id,
      weight: group.proportion,
    })) as NonEmptyArray<{
      id: string;
      weight: number;
    }>;

    const identifiers = this.getIdentifiers(experiment, clientProps);

    const assignmentGroupId = Hash.andAssign(identifiers, groupOptions);
    const assignedGroup = groups.find(
      (group) => group.id === assignmentGroupId,
    );
    if (!assignedGroup) {
      throw new Error(`Failed to find group with id ${assignmentGroupId}`);
    }

    return assignedGroup;
  }

  static getGroupTreatments(experiment: Experiment, group: ExperimentGroup) {
    return group.sequence.map(
      (treatmentId) => experiment.definedTreatments[treatmentId],
    );
  }

  /**
   * Determines which treatment is currently being applied to the passed
   * experiment group
   */
  static currentTreatment(
    experiment: Experiment,
    group: ExperimentGroup,
  ): Treatment | null {
    const start = experiment.startTimestamp;
    if (!start || experiment.status !== 'active') return null;

    const currentTimeMs = Date.now();
    const groupTreatments = this.getGroupTreatments(experiment, group);
    let cumulativeDuration = 0;
    const concurrent = groupTreatments.find(({ duration }) => {
      const startTimeMs = start + cumulativeDuration;
      const endTimeMs = startTimeMs + duration;
      cumulativeDuration += duration;
      return startTimeMs <= currentTimeMs && currentTimeMs < endTimeMs;
    });

    if (!concurrent) return null;
    return concurrent;
  }

  /**
   * Returns true if a rule is active and either there are no start/end timestamps,
   * or the current time is in the range defined by them
   */
  private static ruleInEffect(rule: OverrideRuleUnion): boolean {
    if ('status' in rule && rule.status !== 'active') return false;
    const startTime = rule.startTimestamp ?? 0;
    const endTime = rule.endTimestamp ?? Infinity;
    const currentTime = Date.now();
    return startTime <= currentTime && currentTime < endTime;
  }

  /**
   * Filters the passed `clientProps` for only the props declared on
   * the experiment as identifiers to use, returning a random identifier
   * as a fallback if the filtered array is empty.
   */
  private static getIdentifiers(
    rule: OverrideRuleUnion,
    clientProps: ClientPropMapping,
  ): NonEmptyArray<[string, ClientPropValue]> {
    const fallbackIds: NonEmptyArray<[string, ClientPropValue]> = [
      ['id', crypto.randomUUID()],
    ];

    if (!clientProps) return fallbackIds;
    const propsToHash = new Set(rule.enrollment.attributes);
    const filtered = Object.entries(clientProps).filter(([key]) =>
      propsToHash.has(key));
    const identifiers = (
      filtered.length > 0 ? filtered : fallbackIds
    ) as NonEmptyArray<[string, ClientPropValue]>;

    return identifiers;
  }
}
