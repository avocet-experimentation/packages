/* eslint-disable no-bitwise */
import { z } from 'zod';
import {
  ClientPropEntries,
  ClientPropValue,
  clientPropValueSchema,
} from '../flag-sdk/client-props.schema.js';
import { sortByKey } from './utility-functions.js';
import { NonEmptyArray } from './utility-types.js';
import { nonEmptyStringSchema } from './bounded-primitives.js';

const identifierSchema = z.tuple([z.string(), clientPropValueSchema]);
const identifierArraySchema = z.array(identifierSchema).min(1);

const assignmentOptionSchema = z.object({
  id: nonEmptyStringSchema,
  weight: z.number().gte(0),
});

const assignmentOptionArraySchema = z
  .array(assignmentOptionSchema)
  .min(1)
  .refine((val) => val.reduce((acc, el) => acc + el.weight, 0) > 0);

export const HASH_MAX = 2 ** 32 - 1;

/**
 * (WIP) Generates hash values as 32-bit unsigned integers
 * Methods can throw; implement error handling when using them
 */
export class Hash {
  /**
   * Randomly assign to a passed option, using a hash of client identifiers to
   * ensure consistent assignment to the same option
   * @param identifiers An array of ID entries that uniquely identifies a client
   * @returns the ID of one of the passed options
   */
  static andAssign(
    identifiers: NonEmptyArray<[string, ClientPropValue]>,
    assignmentOptions: NonEmptyArray<{ id: string; weight: number }>,
  ): string {
    const parsedIds = identifierArraySchema.parse(identifiers);
    const { options, weightSum } = this.parsedOptionsAndSum(assignmentOptions);
    const hash = this.hashIdentifiers(parsedIds) % weightSum;
    return this.selectOption(hash, options);
  }

  /**
   * Test a client for assignment against a proportion.
   * @param identifiers An array of ID entries that uniquely identifies a client
   * @param proportion A number between 0 and 1, inclusive
   * @returns
   */
  static andCompare(
    identifiers: [string, ClientPropValue][],
    proportion: number,
  ): boolean {
    const parsedIds = identifierArraySchema.parse(identifiers);
    if (proportion === 0) return false;
    const hash = this.hashIdentifiers(parsedIds);
    const compareValue = proportion * HASH_MAX;
    console.log({ hash, proportion, identifiers });
    return hash < compareValue;
  }

  static strings(strings: readonly string[]) {
    return this.generate(strings.toSorted().join(''));
  }

  /**
   * Hash a string to a 32-bit uint using DJB2
   */
  static generate(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash >>>= 0;
    }

    return hash;
  }

  /**
   * Verifies that at least one assignment option is passed and that their
   * weights sum to a positive value
   * @returns the sorted options and the sum of weights
   */
  protected static parsedOptionsAndSum(
    assignmentOptions: NonEmptyArray<{ id: string; weight: number }>,
  ) {
    const validOptions = assignmentOptionArraySchema.parse(assignmentOptions);
    const options = sortByKey(validOptions, 'id') as NonEmptyArray<{
      id: string;
      weight: number;
    }>;
    const weightSum = options.reduce((acc, option) => acc + option.weight, 0);
    return { options, weightSum };
  }

  protected static hashIdentifiers(identifiers: ClientPropEntries) {
    const sortedIds = identifiers.toSorted();
    const idString = sortedIds.reduce(
      (acc, [name, value]) => acc + name + value,
      '',
    );

    return this.generate(idString);
  }

  protected static selectOption(
    hashValue: number,
    options: NonEmptyArray<{ id: string; weight: number }>,
  ) {
    let hash = hashValue;
    const selected = options.find((option) => {
      if (option.weight >= hash) return true;

      hash -= option.weight;
      return false;
    });

    if (!selected) {
      throw new Error(
        "The hash modulo was larger than all the options' hashes."
          + " This shouldn't happen",
      );
    }
    return selected.id;
  }
}
