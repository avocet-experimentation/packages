import { z } from 'zod';
import { forcedValueSchema } from './forced-value.schema.js';
import { FlagCurrentValue } from '../feature-flags/flag-value.js';
import { Enrollment } from '../experiments/child-classes.js';
import { RequireOnly, SafeOmit } from '../helpers/utility-types.js';

/**
 * A value forced for all users. Permits a blanket override of a flag's default value
 * on a per-environment basis, optionally with a start or end time.
 */
export class ForcedValue implements z.infer<typeof forcedValueSchema> {
  id: string;

  type: 'ForcedValue';

  description: string | null;

  startTimestamp: number | null;

  endTimestamp: number | null;

  environmentName: string;

  value: FlagCurrentValue;

  enrollment: Enrollment;

  constructor(forcedValue: SafeOmit<ForcedValue, 'type'>) {
    this.id = forcedValue.id;
    this.type = 'ForcedValue';
    this.description = forcedValue.description;
    this.startTimestamp = forcedValue.startTimestamp;
    this.endTimestamp = forcedValue.endTimestamp;
    this.environmentName = forcedValue.environmentName;
    this.value = forcedValue.value;
    this.enrollment = forcedValue.enrollment;
  }

  /**
   * Create a ForcedValue, applying defaults to all optional fields that are not passed.
   */
  static template(
    partialForcedValue: RequireOnly<ForcedValue, 'environmentName' | 'value'>,
  ) {
    const defaults = {
      id: crypto.randomUUID(),
      description: null,
      startTimestamp: null,
      endTimestamp: null,
      enrollment: Enrollment.template({ proportion: 1 }),
    };

    return new ForcedValue({ ...defaults, ...partialForcedValue });
  }
}
