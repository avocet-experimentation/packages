import { z } from 'zod';
import { RequireOnly } from '../helpers/utility-types.js';
import { sdkConnectionDraftSchema } from './client-connections.schema.js';

export class SDKConnectionDraft
implements z.infer<typeof sdkConnectionDraftSchema> {
  name: string;

  description: string | null;

  environmentId: string;

  apiKeyHash: string;

  allowedOrigins: string[];

  constructor(draft: SDKConnectionDraft) {
    this.name = draft.name;
    this.description = draft.description;
    this.environmentId = draft.environmentId;
    this.apiKeyHash = draft.apiKeyHash;
    this.allowedOrigins = draft.allowedOrigins;
  }

  static template(
    partialDraft: RequireOnly<SDKConnectionDraft, 'name' | 'environmentId'>,
  ) {
    const defaults = {
      description: null,
      apiKeyHash: this.generateApiKey(),
      allowedOrigins: [],
    };

    return new SDKConnectionDraft({ ...defaults, ...partialDraft });
  }

  /**
   * Generates an API key.
   * @param length The number of bytes for the API key (default is 32 bytes).
   * @returns A base64-encoded API key string.
   */
  static generateApiKey(length = 32) {
    const randomBytes = globalThis.crypto.getRandomValues(
      new Uint8Array(length),
    );
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length);
  }
}
