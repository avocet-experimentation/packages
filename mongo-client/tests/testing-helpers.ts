import {
  FeatureFlagDraft,
  ExperimentDraft,
  AvocetMongoTypes,
  DraftRecord,
} from '@avocet/core';
import { Insert } from '../src/Insert.js';
import MongoRepository from '../src/repository/MongoRepository.js';
import cfg from '../envalid.js';

export const insert = new Insert(cfg.MONGO_TESTING_URI);

const insertIntoRepo = async <T extends AvocetMongoTypes>(
  resultsArray: string[],
  objectArr: DraftRecord<T>[],
  repo: MongoRepository<T>,
) => {
  const promises: Promise<string>[] = [];

  objectArr.forEach((obj) => promises.push(repo.create(obj)));

  const resolved = await Promise.all(promises);
  resultsArray.push(...resolved);
  return resultsArray;
};

export const insertFlags = async (
  resultsArray: string[],
  flags: FeatureFlagDraft[],
) => {
  await insertIntoRepo(resultsArray, flags, insert.manager.featureFlag);
};

export const insertExperiments = async (
  resultsArray: string[],
  experiments: ExperimentDraft[],
) => {
  await insertIntoRepo(resultsArray, experiments, insert.manager.experiment);
};
