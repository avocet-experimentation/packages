import { z } from 'zod';
import { oTelAttributeValueSchema } from '../telemetry/otel/attributes.js';

/**
 * Use these to define dependent variables on Experiments
 * For now, these are embedded into Experiments
 */
export const metricSchema = z.object({
  fieldName: z.string(),
  fieldDataType: oTelAttributeValueSchema,
});

export interface Metric extends z.infer<typeof metricSchema> {}
