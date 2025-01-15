import { ClientPropDef, clientPropDefSchema } from '@avocet/core';
import MongoRepository from './MongoRepository.js';
import { IRepositoryManager } from '../repository-types.js';

export default class ClientPropDefRepository extends MongoRepository<ClientPropDef> {
  constructor(repositoryManager: IRepositoryManager) {
    super('clientPropDef', clientPropDefSchema, repositoryManager);
  }
}
