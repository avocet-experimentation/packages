import { z } from 'zod';
import crypto from 'crypto';
import { clientPropDefDraftSchema } from './client-props.schema.js';
import { FlagValueTypeDef } from '../feature-flags/flag-value.js';
import { RequireOnly } from '../helpers/utility-types.js';
import { clientConnectionDraftSchema } from './client-connections.schema.js';

/**
 * Definition of a client property visible server-side
 */
export class ClientPropDefDraft
implements z.infer<typeof clientPropDefDraftSchema> {
  name: string;

  description: string | null;

  dataType: FlagValueTypeDef;

  isIdentifier: boolean;

  constructor(draft: ClientPropDefDraft) {
    this.name = draft.name;
    this.description = draft.description;
    this.dataType = draft.dataType;
    this.isIdentifier = draft.isIdentifier;
  }

  static template(
    partialDraft: RequireOnly<ClientPropDefDraft, 'name' | 'dataType'>,
  ) {
    const defaults = {
      description: null,
      isIdentifier: false,
    };

    return new ClientPropDefDraft({ ...defaults, ...partialDraft });
  }
}

export class ClientConnectionDraft
implements z.infer<typeof clientConnectionDraftSchema> {
  name: string;

  description: string | null;

  environmentId: string;

  clientKeyHash: string;

  constructor(draft: ClientConnectionDraft) {
    this.name = draft.name;
    this.description = draft.description;
    this.environmentId = draft.environmentId;
    this.clientKeyHash = draft.clientKeyHash;
  }

  static template(
    partialDraft: RequireOnly<ClientConnectionDraft, 'name' | 'environmentId'>,
  ) {
    const defaults = {
      description: null,
      clientKeyHash: this.generateApiKey(),
    };

    return new ClientConnectionDraft({ ...defaults, ...partialDraft });
  }

  /**
   * Generates an API key.
   * @param length The number of bytes for the API key (default is 32 bytes).
   * @returns A base64-encoded API key string.
   */
  static generateApiKey(length = 32) {
    return crypto.randomBytes(length).toString('base64').replace(/[=+/]/g, '');
  }
}
