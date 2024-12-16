/* eslint-disable no-bitwise */
import { randomUUID } from 'node:crypto';
import {
  ClientPropEntries,
  ClientPropValue,
} from '../flag-sdk/client-props.schema.js';
import { sortByKey } from './utility-functions.js';

/**
 * (WIP) Generates unsigned hash values as unsigned integers of up to the
 * passed number of bits.
 *
 * todo:
 * - revise hashStringDJB2 to return 32-bit units
 * - then revise for customizable bit count (up to 32)
 */
export default class Hash {
  bits: number;

  constructor(bits: number) {
    this.bits = bits;
  }

  /**
   * DJB2 Hash function.
   * @param input
   * @returns a signed 32-bit integer
   */
  private static hashStringDJB2(input: string) {
    const str = input.length === 0 ? randomUUID() : input;
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    return hash;
  }

  static hashIdentifiers(identifiers: ClientPropEntries, sort: boolean = true) {
    const sortedIdentifiers = sort ? identifiers.toSorted() : identifiers;
    let string = '';

    sortedIdentifiers.forEach(([name, value]) => {
      string += name + value;
    });

    return this.hashStringDJB2(string);
  }

  /**
   * Hash identifiers for pseudo-random assignment to one of many options
   * @param identifiers An array of values to use collectively as a unique identifier for the client
   * @returns one of the options passed in
   */
  static hashAndAssign(
    identifiers: [string, ClientPropValue][],
    assignmentOptions: readonly { id: string; weight: number }[],
    sort: boolean = true,
  ): string {
    const hash = this.hashIdentifiers(identifiers, sort);
    //
    const weightSum = assignmentOptions.reduce(
      (acc, option) => acc + option.weight,
      0,
    );
    const options = sort
      ? sortByKey([...assignmentOptions], 'id')
      : assignmentOptions;

    // map to weight + prev weight
    // iterating upwards, find the first one larger than the calculated hash
    const positionedOptions = options.reduce(
      (acc: { id: string; hash: number }[], option, i, arr) => {
        const previousWeight = i > 0 ? arr[i - 1].weight : 0;
        const newElement = {
          id: option.id,
          hash: option.weight + previousWeight,
        };
        acc.push(newElement);
        return acc;
      },
      [],
    );
    const hashModulo = hash % weightSum;
    const selected = positionedOptions.find(
      (option) => option.hash >= hashModulo,
    );
    if (!selected) {
      throw new Error(
        "The hash modulo was larger than all the options' hashes."
          + " This shouldn't happen",
      );
    }
    return selected.id;
  }

  static hashAndCompare(
    identifiers: [string, ClientPropValue][],
    proportion: number,
  ): boolean {
    if (proportion === 0) return false;
    const hash = this.hashIdentifiers(identifiers);
    const compareValue = proportion * 2 ** 32 - 2 ** 31 - 1;
    return hash < compareValue;
  }

  /**
   * Combines a collection of strings presumed to be unique IDs.
   * Used for creating a hash of experiment, group, and block ID for sending to client
   */
  static sortAndCombineIds(ids: readonly string[]): string {
    const sortedIds = ids.toSorted();
    const combined = sortedIds.join('');
    return combined;
  }

  static hashStringSet(strings: readonly string[]) {
    const combined = this.sortAndCombineIds(strings);
    return this.hashStringDJB2(combined);
  }
}
