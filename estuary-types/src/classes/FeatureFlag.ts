import { z } from "zod";
import { featureFlagDraftSchema, FlagEnvironmentMapping } from "../featureFlags.js";
import { FlagValueDef } from "../flags/flagValues.js";
import {
  FlagValueDefTemplate,
  FlagEnvironmentMappingTemplate,
 } from "./FeatureFlagSubclasses.js";

export class FeatureFlagDraft implements z.infer<typeof featureFlagDraftSchema> {
  name: string;
  description?: string;
  value: FlagValueDef;
  environments: FlagEnvironmentMapping;

  constructor(draft: FeatureFlagDraft) {
    this.name = draft.name;
    this.description = draft.description;
    this.value = draft.value;
    this.environments = draft.environments;
  }
}


export class FeatureFlagDraftTemplate extends FeatureFlagDraft {
  constructor(name: string, dataType: "string" | "number" | "boolean") {
    const defaults = {
      value: new FlagValueDefTemplate(dataType) as FlagValueDef,
      environments: new FlagEnvironmentMappingTemplate(),
    };

    super({ name, ...defaults });
  }
}
