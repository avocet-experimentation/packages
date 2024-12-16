import { z } from 'zod';

export const avocetMongoCollectionNameSchema = z.enum([
  'featureFlag',
  'experiment',
  'environment',
  'clientPropDef',
  'sdkConnection',
  'user',
]);

export type AvocetMongoCollectionName = z.infer<
  typeof avocetMongoCollectionNameSchema
>;

// might add more criteria later
export const flagNameSchema = z.string();
export const environmentNameSchema = z.string();
