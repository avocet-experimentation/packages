import { z } from "zod";
import { clientPropDefDraftSchema } from "./client-props.schema.js";
import { FlagValueTypeDef } from "../feature-flags/flag-value.js";
import { RequireOnly } from "../helpers/utility-types.js";

/**
 * Definition of a client property visible server-side
 */
export class ClientPropDefDraft implements z.infer<typeof clientPropDefDraftSchema> {
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

  static template(partialDraft: RequireOnly<ClientPropDefDraft, 'name' | 'dataType'>) {
    const defaults = {
      description: null,
      isIdentifier: false,
    };

    return new ClientPropDefDraft({ ...defaults, ...partialDraft });
  }
}