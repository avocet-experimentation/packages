import { FeatureFlagDraft } from "../featureFlags.js";
import { FlagEnvironmentMapping } from "../flags/flagEnvironments.js";
import { FlagValueDef } from "../flags/flagValues.js";
import {
  FlagValueDefTemplate,
  FlagEnvironmentMappingTemplate,
} from "./FeatureFlagSubclasses.js";

export class FeatureFlagDraftImpl implements FeatureFlagDraft {
  name: string;
  description?: string;
  value: FlagValueDef;
  environments: FlagEnvironmentMapping;

  constructor({ name, description, value, environments}: FeatureFlagDraft) {
    this.name = name;
    this.description = description;
    this.value = value;
    this.environments = environments;
  }
}

export class FeatureFlagDraftTemplate extends FeatureFlagDraftImpl {
  constructor(name: string, dataType: "string" | "number" | "boolean") {    
    const defaults = {
      value: new FlagValueDefTemplate(dataType) as FlagValueDef,
      environments: new FlagEnvironmentMappingTemplate(),
    }

    super({ name, ...defaults });
  }
}
