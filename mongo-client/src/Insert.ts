import {
  AvocetMongoCollectionName,
  AvocetMongoTypes,
  DraftRecord,
  SDKConnectionDraft,
  ClientPropDefDraft,
  EnvironmentDraft,
  ExperimentDraft,
  FeatureFlagDraft,
  UserDraft,
} from '@avocet/core';
import { Db } from 'mongodb';
import { IRepositoryManager } from './repository-types.js';
import MongoRepository from './repository/MongoRepository.js';
import RepositoryManager from './RepositoryManager.js';

/**
 * Helper class for inserting seed, example, and test data into MongoDB
 */
export class Insert {
  manager: IRepositoryManager;

  db: Db;

  constructor(connectionString: string) {
    this.manager = new RepositoryManager(connectionString);
    this.db = this.manager.client.db();
    this.eraseCollection = this.eraseCollection.bind(this);
    this.eraseTestData = this.eraseTestData.bind(this);
  }

  async eraseCollection(collectionName: AvocetMongoCollectionName) {
    await this.db.dropCollection(collectionName);
  }

  async eraseTestData() {
    await this.eraseCollection('featureFlag');
    await this.eraseCollection('experiment');
    await this.eraseCollection('clientPropDef');
    await this.eraseCollection('environment');
    await this.eraseCollection('sdkConnection');
    await this.eraseCollection('user');
  }

  async featureFlags(obj: FeatureFlagDraft[]) {
    await Insert.drafts(obj, this.manager.featureFlag);
  }

  async clientPropDefs(arr: ClientPropDefDraft[]) {
    await Insert.drafts(arr, this.manager.clientPropDef);
  }

  async SDKConnections(arg: SDKConnectionDraft[]) {
    await Insert.drafts(arg, this.manager.sdkConnection);
  }

  async environments(arr: EnvironmentDraft[]) {
    await Insert.drafts(arr, this.manager.environment);
  }

  async experiments(arr: ExperimentDraft[]) {
    await Insert.drafts(arr, this.manager.experiment);
  }

  async users(arg: UserDraft[]) {
    await Insert.drafts(arg, this.manager.user);
  }

  protected static async drafts<T extends AvocetMongoTypes>(
    drafts: DraftRecord<T>[],
    collection: MongoRepository<T>,
  ) {
    const promises: Promise<string>[] = [];
    for (let i = 0; i < drafts.length; i += 1) {
      promises.push(collection.create(drafts[i]));
    }
    await Promise.all(promises);
  }
}
