import { z } from "zod";

export const estuaryMongoCollectionNameSchema = z.enum([
  'featureFlag',
  'experiment',
  'environment',
  'clientPropDef',
  'clientConnection',
  'user',
]);

export type EstuaryMongoCollectionName = z.infer<typeof estuaryMongoCollectionNameSchema>;

// might add more criteria later
export const flagNameSchema = z.string();
export const environmentNameSchema = z.string();