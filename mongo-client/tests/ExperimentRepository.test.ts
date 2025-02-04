import {
  afterAll, beforeAll, beforeEach, describe, expect, it,
} from 'vitest';
import { ObjectId } from 'mongodb';
import {
  ExperimentDraft,
  ExperimentReference,
  FeatureFlagDraft,
  FlagValueDefImpl,
  Hypothesis,
  idMap,
  Treatment,
} from '@avocet/core';
import { staticFlagDrafts } from './data/featureFlags.js';
import { exampleExperiments } from './data/experiments.js';
import {
  insertFlags,
  insertExperiments,
  insert,
} from './testing-helpers.js';

const { featureFlag, experiment } = insert.manager;

beforeAll(async () => { await insert.eraseTestData(); });

const setupExperimentRepoTests = async (insertResults: string[]) => {
  await insert.eraseTestData();
  const flagInsertResults: string[] = [];

  await insertFlags(flagInsertResults, staticFlagDrafts.slice(0, 2));
  await insertExperiments(insertResults, exampleExperiments);
  // console.log('---- FINISHED INSERTING SETUP DATA -----');
};

describe('Embed methods', () => {
  describe('createEmbeds', () => {
    const insertResults: string[] = [];
    beforeEach(async () => {
      await insert.eraseTestData();
      await insertFlags(insertResults, staticFlagDrafts.slice(0, 2));
      await insertExperiments(insertResults, exampleExperiments);
      // console.log('---- FINISHED INSERTING SETUP DATA -----')
    });

    it('creates an embedded ExperimentReference on a flag given valid input', async () => {
      const expDraft = { ...exampleExperiments[0] };
      const flags = await insert.manager.featureFlag.getMany(2);
      if (!flags.length) throw new Error('Flags should exist!');

      const expDoc = await experiment.findOne({
        name: expDraft.name,
      });
      if (!expDoc) throw new Error(`Experiment ${expDraft.name} should exist!`);

      expDoc.flagIds.push(flags[0].id);
      const embedsCreated = await experiment.createEmbeds(expDoc);
      expect(embedsCreated).toBe(true);

      const findQuery = {
        _id: ObjectId.createFromHexString(expDoc.flagIds[0]),
      };
      const updatedFlags = await insert.manager.featureFlag.findMany(findQuery);
      expect(updatedFlags).toHaveLength(1);
      const updatedRules = updatedFlags[0].overrideRules;
      const { startTimestamp, endTimestamp, ...rest } = new ExperimentReference(
        expDoc,
      );
      const match = updatedRules.find(
        (rule) => 'id' in rule && rule.id === expDoc.id,
      );
      expect(match).toMatchObject(rest);
    });

    it.skip('returns true if passed a valid experiment with an empty flagIds array', async () => {});

    it.skip('throws an error if any IDs on `flagIds` match no flags', async () => {});

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('startExperiment', () => {
    const insertResults: string[] = [];
    beforeEach(async () => { await setupExperimentRepoTests(insertResults); });

    it('creates an embedded ExperimentReference on a flag given valid input', async () => {
      const now = Date.now();
      const expDraft = { ...exampleExperiments[0] };
      const flags = await insert.manager.featureFlag.getMany(2);
      if (!flags.length) throw new Error('Flags should exist!');

      const expDoc = await experiment.findOne({
        name: expDraft.name,
      });
      if (!expDoc) throw new Error(`Experiment ${expDraft.name} should exist!`);

      const newFlag = FeatureFlagDraft.template({
        name: 'new-feature-toggle',
        value: FlagValueDefImpl.template('boolean'),
        environmentNames: { production: true },
      });

      const newFlagId = await featureFlag.create(newFlag);
      const newFlagDoc = await featureFlag.get(newFlagId);

      // add the flag and a group with two treatments
      const treatments = [
        Treatment.template({
          name: 'Control',
          flagStates: [{ id: newFlagId, value: false }],
          duration: 1000,
        }),
        Treatment.template({
          name: 'Experimental',
          flagStates: [{ id: newFlagId, value: true }],
          duration: 1000,
        }),
      ];
      ExperimentDraft.addFlag(expDoc, newFlagDoc);
      ExperimentDraft.addGroup(expDoc);
      expDoc.groups[0] = {
        ...expDoc.groups[0],
        name: 'Users',
        sequence: [treatments[0].id, treatments[1].id],
        cycles: 2,
      };
      expDoc.definedTreatments = idMap(treatments);
      expDoc.dependents.push({ type: 'number', fieldName: 'user-rating' });
      expDoc.hypotheses.push(
        Hypothesis.template({
          dependentName: 'user-rating',
          baseConditionRef: [expDoc.groups[0].id, treatments[0].id],
          testConditionRef: [expDoc.groups[0].id, treatments[1].id],
          analysis: 't-test',
        }),
      );

      const updateResult = await experiment.update(expDoc);
      if (!updateResult) throw new Error('Update failed');

      const startResult = await experiment.start(expDoc.id);
      expect(startResult).toBe(true);

      const updatedExpDoc = await experiment.get(expDoc.id);

      expect(updatedExpDoc.status).toBe('active');
      expect(typeof updatedExpDoc.startTimestamp).toBe('number');
      expect(updatedExpDoc.startTimestamp).toBeGreaterThanOrEqual(now);
      expect(updatedExpDoc.startTimestamp).toBeLessThanOrEqual(Date.now());
    });

    it.skip('returns true if passed a valid experiment with an empty flagIds array', async () => {});

    it.skip('throws an error if any IDs on `flagIds` match no flags', async () => {});

    afterAll(async () => { await insert.eraseTestData(); });
  });

  // WIP
  describe('deleteEmbeds', () => {
    const insertResults: string[] = [];
    beforeEach(async () => {
      await insert.eraseTestData();
      const flagInsertResults: string[] = [];
      await insertFlags(flagInsertResults, staticFlagDrafts.slice(0, 2));

      const expWithFlag = { ...exampleExperiments[0] };
      expWithFlag.flagIds.push(flagInsertResults[0], flagInsertResults[1]);

      await insertExperiments(insertResults, [expWithFlag]);
      // console.log('---- FINISHED INSERTING SETUP DATA -----');
    });

    it('Removes matching embeds from all flags, and returns true', async () => {
      const experimentId = insertResults[0];
      // console.log({experimentId})
      await insert.manager.featureFlag.getMany();
      // printDetail({originalFlags})
      // const experimentDoc = await experiment.get(experimentId);
      const embedDeleteResult = await experiment.deleteEmbeds(experimentId);
      expect(embedDeleteResult).toBe(true);
      // const insertedExperiment = await experiment.get(insertResults[0]);
      const updatedFlags = await insert.manager.featureFlag.getMany();
      // printDetail({updatedFlags})
      const ruleSets = updatedFlags.map((flag) => flag.overrideRules);
      expect(ruleSets).toHaveLength(2);
      // printDetail({deleteRuleSets: ruleSets});

      // printDetail({insertedExperiment});
      expect(
        ruleSets[0].find((rule) => rule.id === experimentId),
      ).toBeUndefined();
      expect(
        ruleSets[1].find((rule) => rule.id === experimentId),
      ).toBeUndefined();
      expect(embedDeleteResult).toBe(true);
    });

    it.skip('Returns false (throws?) when ', async () => {});

    afterAll(async () => { await insert.eraseTestData(); });
  });

  describe('updateEmbeds', () => {
    const insertResults: string[] = [];
    beforeEach(async () => {
      await insert.eraseTestData();
      const flagInsertResults: string[] = [];
      await insertFlags(flagInsertResults, staticFlagDrafts.slice(0, 2));

      const expWithFlag = { ...exampleExperiments[0] };
      expWithFlag.flagIds.push(flagInsertResults[0], flagInsertResults[1]);

      await insertExperiments(insertResults, [expWithFlag]);
      // console.log('---- FINISHED INSERTING SETUP DATA -----');
    });

    it('overwrites the specified fields on embeds', async () => {
      const experimentDoc = await experiment.get(insertResults[0]);
      const flagsWithEmbed = await experiment.getDocumentsWithEmbeds(experimentDoc.id);
      // printDetail({flagsWithEmbed})
      const ruleSets = flagsWithEmbed.map((flag) => flag.overrideRules);

      const currentEmbedReference = ruleSets[0].find(
        (rule) => rule.id === experimentDoc.id,
      );
      if (!currentEmbedReference) throw new Error('rule should exist!');
      if (currentEmbedReference.type !== 'Experiment') {
        throw new Error('rule should be an Experiment!');
      }

      const partialUpdate = {
        id: experimentDoc.id,
        startTimestamp: Date.now(),
      };

      const updateResult = await experiment.updateEmbeds(partialUpdate);

      expect(updateResult).toBe(true);

      const updatedFlagsWithEmbed = await insert.manager.featureFlag.findMany({
        _id: { $in: experimentDoc.flagIds.map(ObjectId.createFromHexString) },
      });

      // console.log({ experimentId: experimentDoc.id })
      // printDetail({updatedFlagsWithEmbed})
      const updatedEmbedReferences = updatedFlagsWithEmbed
        .map((flag) => flag.overrideRules)
        .map((ruleSet) =>
          ruleSet.filter((rule) => rule.id === experimentDoc.id))
        .flat();

      // console.log({ expId: experimentDoc.id })
      expect(updatedEmbedReferences).toHaveLength(2);
      // printDetail({updatedEmbedReferences});
      expect(typeof updatedEmbedReferences[0].startTimestamp).toEqual('number');
      expect(typeof updatedEmbedReferences[1].startTimestamp).toEqual('number');
    });

    it.skip('Correctly adds embeds if a flag was added to flagIds', async () => {
      // todo: verify embeds added onto new flag
    });

    it.skip('Correctly removes embeds if a flag was removed from flagIds', async () => {
      // todo: verify the removed flag also has its embed removed
    });

    it.skip("Preserves embed index within flags' override rules array", async () => {
      // const result = await insert.manager.featureFlag.update({
      //   id: ObjectId.createFromTime(1).toHexString(),
      //   name: 'asdfoasihgda',
      // });
      // expect(result).toBeFalsy();
    });

    it.skip("doesn't modify embed fields that were not passed", async () => {
      // const second = insertResults[1];
      // const original = exampleFlagDrafts[1];
      // if (second === null) return;
      // const updateName = 'updated testing flag';
      // const result = await repo.featureFlag.update({ id: second, name: updateName });
      // expect(result).toBeTruthy();
      // const updatedFirst = await repo.featureFlag.get(second);
      // expect(updatedFirst).not.toBeNull();
      // if (updatedFirst === null) return;
      // const { createdAt, updatedAt, ...withoutTimeStamps } = updatedFirst;
      // expectTypeOf(createdAt).toBeNumber();
      // expectTypeOf(updatedAt).toBeNumber();
      // expect(updatedAt).toBeGreaterThanOrEqual(createdAt);
      // const reconstructed = { ...withoutTimeStamps, name: original.name };
      // expect(reconstructed).toStrictEqual({ id: second, ...original });
    });

    it.skip('Makes no changes if no embed matches', async () => {
      // const result = await insert.manager.featureFlag.update({
      //   id: ObjectId.createFromTime(1).toHexString(),
      //   name: 'asdfoasihgda',
      // });
      // expect(result).toBeFalsy();
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });
  // might not implement this method
  describe.skip('getEmbeds', () => {
    const insertResults: string[] = [];
    beforeAll(async () => setupExperimentRepoTests(insertResults));

    it('returns no flags if the experiment has no flags', async () => {
      const result = await experiment.getDocumentsWithEmbeds(
        insertResults[0],
      );
      expect(result).toHaveLength(10);
    });

    it('returns all flags containing embeds matching an `experimentId`', async () => {
      const result = await insert.manager.featureFlag.getMany(5);
      expect(result).toHaveLength(5);
    });

    it("returns no flags if an `experimentId` isn't passed", async () => {
      const result = await insert.manager.featureFlag.getMany(50);
      expect(result).toHaveLength(10);
    });

    afterAll(async () => { await insert.eraseTestData(); });
  });
});

afterAll(async () => { await insert.eraseTestData(); });
