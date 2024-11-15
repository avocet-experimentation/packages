import { z } from "zod";
import { FlagEnvironmentMapping, FlagEnvironmentProps } from "../flags/flagEnvironments.js";

class FlagEnvironmentMap implements FlagEnvironmentMapping {
  prod: FlagEnvironmentProps;
  dev: FlagEnvironmentProps;
  testing: FlagEnvironmentProps;
  staging: FlagEnvironmentProps;

  constructor(
    prod: FlagEnvironmentProps,
    dev: FlagEnvironmentProps,
    testing: FlagEnvironmentProps,
    staging: FlagEnvironmentProps) {
      this.prod = prod;
      this.dev = dev;
      this.testing = testing;
      this.staging = staging;
  }
}
