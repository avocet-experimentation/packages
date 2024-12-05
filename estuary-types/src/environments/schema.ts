import { z } from 'zod';
import { environmentNameSchema } from '../helpers/names.js';

export const environmentDraftSchema = z.object({
  name: environmentNameSchema,
  defaultEnabled: z.boolean(),
  pinToLists: z.boolean(),
});
