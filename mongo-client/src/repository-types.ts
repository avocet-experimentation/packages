/* eslint-disable import/no-cycle */
import { AvocetMongoTypes, BeforeId, RequireOnly } from '@avocet/core';
import { MongoClient, WithId } from 'mongodb';
import ExperimentRepository from './repository/ExperimentRepository.js';
import FeatureFlagRepository from './repository/FeatureFlagRepository.js';
import ClientPropDefRepository from './repository/ClientPropDefRepository.js';
import EnvironmentRepository from './repository/EnvironmentRepository.js';
import SDKConnectionRepository from './repository/SDKConnectionRepository.js';
import UserRepository from './repository/UserRepository.js';

/* TYPE DEFINITIONS FOR WORKING WITH MONGO RECORDS */

export type MongoRecord<T extends AvocetMongoTypes> = WithId<BeforeId<T>>;
/**
 * A partial type that only requires an `id` field
 */
export type PartialWithStringId<T extends AvocetMongoTypes> = RequireOnly<
T,
'id'
>;

export interface IRepositoryManager {
  client: MongoClient;

  featureFlag: FeatureFlagRepository;
  experiment: ExperimentRepository;
  clientPropDef: ClientPropDefRepository;
  environment: EnvironmentRepository;
  sdkConnection: SDKConnectionRepository;
  user: UserRepository;
}
