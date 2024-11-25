import { z } from "zod";

export const flagValueTypeDefSchema = z.enum(['string', 'number', 'boolean']);

export type FlagValueTypeDef = z.infer<typeof flagValueTypeDefSchema>;

export const flagCurrentValueSchema = z.union([z.boolean(), z.string(), z.number()]);
/**
 * All supported flag value types
 */
export type FlagCurrentValue = z.infer<typeof flagCurrentValueSchema>;

export const flagBooleanValueSchema = z.object({
  type: z.literal("boolean"),
  initial: z.boolean(),
});

class FlagBooleanValue implements z.infer<typeof flagBooleanValueSchema> {
  type: 'boolean';
  initial: boolean;

  constructor(value: FlagBooleanValue) {
    this.type = value.type;
    this.initial = value.initial;
  }
}

export const flagStringValueSchema = z.object({
  type: z.literal("string"),
  initial: z.string(),
});

class FlagStringValue implements z.infer<typeof flagStringValueSchema> {
  type: 'string';
  initial: string;

  constructor(value: FlagStringValue) {
    this.type = value.type;
    this.initial = value.initial;
  }
}

export const flagNumberValueSchema = z.object({
  type: z.literal("number"),
  initial: z.number(),
});

class FlagNumberValue implements z.infer<typeof flagNumberValueSchema> {
  type: 'number';
  initial: number;

  constructor(value: FlagNumberValue) {
    this.type = value.type;
    this.initial = value.initial;
  }
}

export const flagValueDefSchema = z.union([
  flagBooleanValueSchema,
  flagNumberValueSchema,
  flagStringValueSchema,
]);
/**
 * The definition of a feature flag's data type and default value
 */
export type FlagValueDef = z.infer<typeof flagValueDefSchema>;

export type FlagCurrentValueFromTypeDef<D extends FlagValueTypeDef> =
D extends 'string' ? string :
D extends 'number' ? number :
D extends 'boolean' ? boolean :
never;
export type FlagValueFromTypeDef<D extends FlagValueTypeDef> =
D extends 'string' ? FlagStringValue :
D extends 'number' ? FlagNumberValue :
D extends 'boolean' ? FlagBooleanValue :
never;

export class FlagValueDefImpl<T extends FlagValueTypeDef> {
  type: T;
  initial: FlagCurrentValueFromTypeDef<T>;

  constructor(flagValueDef: FlagValueDefImpl<T>) {
    this.type = flagValueDef.type;
    this.initial = flagValueDef.initial;
  }

  static template<T extends FlagValueTypeDef>(type: T) {
    if (type === 'boolean') {
      return new FlagValueDefImpl({ type: 'boolean', initial: false });
    } else if (type === 'string') {
      return new FlagValueDefImpl({ type: 'string', initial: '' });
    } else if (type === 'number') {
      return new FlagValueDefImpl({ type: 'number', initial: 0 });
    } else {
      throw new TypeError(`Argument ${type} must be a FlagValueTypeDef`);
    }
  }
}
