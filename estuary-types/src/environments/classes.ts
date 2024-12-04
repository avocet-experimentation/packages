import { z } from 'zod';
import { environmentDraftSchema } from './schema.js';
import { RequireOnly } from '../helpers/utility-types.js';

export class EnvironmentDraft
implements z.infer<typeof environmentDraftSchema> {
  name: string;

  defaultEnabled: boolean;

  pinToLists: boolean;

  constructor(draft: EnvironmentDraft) {
    this.name = draft.name;
    this.defaultEnabled = draft.defaultEnabled;
    this.pinToLists = draft.pinToLists;
  }

  static template(partial: RequireOnly<EnvironmentDraft, 'name'>) {
    const defaults = {
      defaultEnabled: false,
      pinToLists: false,
    };

    return new EnvironmentDraft({ ...defaults, ...partial });
  }
}
