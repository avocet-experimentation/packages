import { FeatureFlagDraftImpl } from "./FeatureFlag.js";

import { FlagValueDef } from "../flags/flagValues.js";
import { FlagValueDefTemplate, FlagEnvironmentMappingTemplate } from "./FeatureFlagSubclasses.js";


export class FeatureFlagDraftTemplate extends FeatureFlagDraftImpl {
  constructor(name: string, dataType: "string" | "number" | "boolean") {
    const defaults = {
      value: new FlagValueDefTemplate(dataType) as FlagValueDef,
      environments: new FlagEnvironmentMappingTemplate(),
    };

    super({ name, ...defaults });
  }
}
