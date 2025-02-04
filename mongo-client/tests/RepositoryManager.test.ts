import { ObjectId } from 'mongodb';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
} from 'vitest';
import {
  FeatureFlagDraft,
  FlagValueDefImpl,
  ForcedValue,
  OverrideRuleUnion,
} from '@avocet/core';
import {
  exampleFlagDrafts,
  getExampleFlag,
  staticFlagDrafts,
} from './data/featureFlags.js';
import { insertFlags, insert } from './testing-helpers.js';

const { featureFlag } = insert.manager;
beforeAll(async () => { await insert.eraseTestData(); });

describe('MongoRepository CRUD Methods', () => {
  describe('create', () => {
    beforeEach(async () => { await insert.eraseTestData(); });

    it('creates a flag and returns its `ObjectId` as a string if passed an object with no `.id`', async () => {
      const result = await featureFlag.create(getExampleFlag());
      expect(typeof result).toBe('string');
    });

    it('throws an error if passed an object with a `.id`', async () => {
      const input = { ...getExampleFlag(), id: crypto.randomUUID() };
      await expect(async () => {
        await featureFlag.create(input);
      }).rejects.toThrow();
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('getMany', () => {
    beforeAll(async () => {
      await insert.eraseTestData();
      const insertions = new Array(10).fill(null).map(() =>
        featureFlag.create(
          FeatureFlagDraft.template({
            name: `name-${crypto.randomUUID()}`,
            value: FlagValueDefImpl.template('boolean'),
          }),
        ));
      await Promise.all(insertions);
    });

    it("returns all flags if a `maxCount` isn't passed", async () => {
      const result = await featureFlag.getMany();
      expect(result).toHaveLength(10);
    });

    it('returns `maxCount` flags if a valid number is passed <= collection size', async () => {
      const result = await featureFlag.getMany(5);
      expect(result).toHaveLength(5);
    });

    it('returns all flags if `maxCount` >= collection size', async () => {
      const result = await featureFlag.getMany(50);
      expect(result).toHaveLength(10);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('get', () => {
    let insertResult: string;
    beforeAll(async () => {});

    it('returns a previously inserted flag if provided its ObjectId as a hex string', async () => {
      const toInsert = FeatureFlagDraft.template({
        name: 'get-test',
        value: FlagValueDefImpl.template('boolean'),
      });

      insertResult = await featureFlag.create(toInsert);
      const result = await featureFlag.get(insertResult);
      const bareObj = JSON.parse(JSON.stringify(toInsert));
      expect(result).toMatchObject(bareObj);
    });

    it('throws if provided an invalid ID', async () => {
      await expect(async () => { await featureFlag.get('invalid-id'); }).rejects.toThrow();
    });

    it('throws if provided an incorrect ID', async () => {
      const randomObjectIdString = ObjectId.createFromTime(99).toHexString();
      await expect(async () => { await featureFlag.get(randomObjectIdString); }).rejects.toThrow();
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('findOne', () => {
    const insertResults: string[] = [];
    beforeAll(async () => {
      await insertFlags(insertResults, exampleFlagDrafts.slice(0, 3));
    });

    it('finds the right record from a query on its name', async () => {
      const first = insertResults[0];

      const result = await featureFlag.findOne({
        name: 'testing flag',
      });
      expect(result?.id).toEqual(first);
    });

    it('finds the right record from a substring match on description', async () => {
      const second = insertResults[1];
      if (second === null) return;

      const result = await featureFlag.findOne({
        description: { $regex: /server-sent events/ },
      });
      expect(result?.id).toEqual(second);
    });

    it('Returns null if no records match the query', async () => {
      const result = await featureFlag.findOne({
        name: 'asdfoasihgda',
      });
      expect(result).toBeNull();
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('update', () => {
    const insertResults: string[] = [];
    beforeAll(async () =>
      insertFlags(insertResults, exampleFlagDrafts.slice(0, 3)));

    it('overwrites primitive fields', async () => {
      const first = insertResults[0];

      const updateObject = {
        id: first,
        value: {
          type: 'number' as const,
          initial: 3,
        },
      };
      const result = await featureFlag.update(updateObject);
      expect(result).toBe(true);

      const updatedFirst = await featureFlag.get(first);
      expect(updatedFirst).toMatchObject(updateObject);
    });

    it('overwrites object fields when the update argument contains nested objects', async () => {
      const first = insertResults[0];

      const updateObject = {
        id: first,
        environmentNames: { novelEnvironment: true as const },
      };
      const result = await featureFlag.update(updateObject);
      expect(result).toBe(true);

      const updatedFirst = await featureFlag.get(first);
      // printDetail({ first: exampleFlagDrafts[0] });
      // printDetail({ updatedFirst });
      expect(updatedFirst).toMatchObject(updateObject);
    });

    it("doesn't modify fields not passed in the update object", async () => {
      const second = insertResults[1];
      const original = exampleFlagDrafts[1];

      const updateName = 'updated testing flag';
      const result = await featureFlag.update({
        id: second,
        name: updateName,
      });
      expect(result).toBe(true);

      const updatedFirst = await featureFlag.get(second);
      expect(updatedFirst).not.toBeNull();
      if (updatedFirst === null) return;

      const { createdAt, updatedAt, ...withoutTimeStamps } = updatedFirst;
      expectTypeOf(createdAt).toBeNumber();
      expectTypeOf(updatedAt).toBeNumber();
      expect(updatedAt).toBeGreaterThanOrEqual(createdAt);

      const reconstructed = { ...withoutTimeStamps, name: original.name };
      expect(reconstructed).toStrictEqual({ id: second, ...original });
    });

    it("doesn't overwrite if no document matches the `id`", async () => {
      const updateObject = {
        id: ObjectId.createFromTime(1).toHexString(),
        name: 'asdfoasihgda',
      };
      await featureFlag.update(updateObject);

      const allFlags = await featureFlag.getMany();

      expect(allFlags).not.toContainEqual(updateObject);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  // WIP
  describe('updateKeySafe', () => {
    const insertResults: string[] = [];
    beforeAll(async () => {
      await insert.eraseTestData();
      await insertFlags(insertResults, exampleFlagDrafts.slice(0, 3));
    });

    it('Changes the value on a single property', async () => {
      const first = insertResults[0];

      const result = await featureFlag.updateKeySafe(
        first,
        'value.initial',
        true,
      );
      expect(result).toBe(true);

      const updatedFirst = await featureFlag.get(first);
      // expect(updatedFirst).not.toBeNull();
      expect(updatedFirst.value).toMatchObject({
        type: 'boolean',
        initial: true,
      });
    });

    it.skip('Rejects changes that break the schema', async () => {
      const first = insertResults[0];
      await featureFlag.get(first);
      await featureFlag.updateKeySafe(
        first,
        'value.type',
        'number',
      ); // this might break the schema
      const updatedFirst = await featureFlag.get(first);
      expect(updatedFirst.value).toMatchObject({
        type: 'boolean',
        initial: true,
      });
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  // WIP
  describe('pushTo', () => {
    const insertResults: string[] = [];
    beforeAll(async () => {
      await insertFlags(insertResults, exampleFlagDrafts.slice(0, 3));
    });

    it('Adds an element to an array', async () => {
      const first = insertResults[0];
      // const firstDoc = await repo.featureFlag.get(first);
      // console.log(firstDoc);

      const newRule: ForcedValue = ForcedValue.template({
        value: true,
        environmentName: 'dev',
        enrollment: {
          attributes: [],
          proportion: 1,
        },
      });
      const result = await featureFlag.pushTo(
        'overrideRules',
        newRule,
        first,
      );
      expect(result.acknowledged).toBe(true);

      const updatedFirst = await featureFlag.get(first);
      expect(updatedFirst.overrideRules).toContainEqual(newRule);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  // WIP
  describe('pull', () => {
    const insertResults: string[] = [];

    beforeAll(async () => {
      await insertFlags(insertResults, staticFlagDrafts.slice(0, 1));
    });

    it('Removes an element from an array given a partial version of it', async () => {
      const firstId = insertResults[0];
      const forcedValueRule: OverrideRuleUnion = staticFlagDrafts[0].overrideRules[0];
      const firstDoc = await featureFlag.get(firstId);
      const { id, name, ...matcher } = firstDoc;

      const result = await featureFlag.pull(
        'overrideRules',
        forcedValueRule,
        matcher,
      );
      expect(result.acknowledged).toBe(true);

      const updatedFirst = await featureFlag.get(firstId);
      expect(updatedFirst.overrideRules).not.toContainEqual(forcedValueRule);
    });

    it('Removes an element from multiple documents', async () => {
      const forcedValueRule = staticFlagDrafts[0].overrideRules[0];

      const matcher = {
        'value.type': 'boolean',
      };

      const result = await featureFlag.pull(
        'overrideRules',
        forcedValueRule,
        matcher,
      );
      expect(result.acknowledged).toBe(true);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  // WIP
  describe('pullFrom', () => {
    const insertResults: (string | null)[] = [];
    beforeAll(async () => {
      const result = await featureFlag.create(staticFlagDrafts[0]);
      insertResults.push(result);
    });

    it("Removes an element from an array given the document's ID", async () => {
      const firstId = insertResults[0];
      if (firstId === null) return;
      await featureFlag.get(firstId);

      const ruleToRemove = staticFlagDrafts[0].overrideRules[0];

      const result = await featureFlag.pullFrom(
        'overrideRules',
        ruleToRemove,
        firstId,
      );
      expect(result.acknowledged).toBe(true);

      const updatedFirst = await featureFlag.get(firstId);
      expect(updatedFirst.overrideRules).not.toContainEqual(ruleToRemove);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('delete', () => {
    const insertResults: string[] = [];
    beforeAll(async () =>
      insertFlags(insertResults, exampleFlagDrafts.slice(0, 3)));

    it('deletes the right record given a valid id', async () => {
      const first = insertResults[0];
      const result = await featureFlag.delete(first);
      expect(result).toBe(true);
      await expect(async () => featureFlag.get(first)).rejects.toThrow();
    });

    it('Throws an error if no records matches the passed id', async () => {
      const fakeId = ObjectId.createFromTime(0).toHexString();
      await expect(async () =>
        featureFlag.delete(fakeId)).rejects.toThrow();
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });
});

describe('MongoRepository Helper Methods', () => {
  describe('keyPathToObject', () => {
    it('Creates a nested object given a dot-separated keyPath', () => {
      const path = 'environments.prod.enabled';
      const newValue = false;
      const result = featureFlag.keyPathToObject(path, newValue);
      expect(result).toMatchObject({
        environments: {
          prod: {
            enabled: false,
          },
        },
      });
    });

    it.skip('Creates an object given a keyPath with just one key', () => {});

    it.skip('Handles empty strings', () => {});
  });
});

afterAll(async () => { await insert.eraseTestData(); });
