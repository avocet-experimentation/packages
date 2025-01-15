import {
  AvocetMongoTypes,
  BeforeId,
  RequireOnly,
  FeatureFlag,
  Experiment,
  ClientPropDef,
  Environment,
  SDKConnection,
  User,
} from '@avocet/core';
import { MongoClient, WithId } from 'mongodb';
// eslint-disable-next-line import/no-cycle
import MongoRepository from './repository/MongoRepository.js';

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

  featureFlag: MongoRepository<FeatureFlag>;
  experiment: MongoRepository<Experiment>;
  clientPropDef: MongoRepository<ClientPropDef>;
  environment: MongoRepository<Environment>;
  sdkConnection: MongoRepository<SDKConnection>;
  user: MongoRepository<User>;
}
