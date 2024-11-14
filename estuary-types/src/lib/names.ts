import { z } from "zod";


export const estuaryMongoCollectionNameSchema = z.enum([
  'FeatureFlag',
  'Experiment',
  'Environment',
  'ClientPropDef',
  'ClientConnection',
  'User',
]);

export type EstuaryMongoCollectionName = z.infer<typeof estuaryMongoCollectionNameSchema>;

// might add more criteria later
export const flagNameSchema = z.string();

