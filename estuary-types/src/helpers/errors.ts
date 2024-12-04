import { ZodArray, z } from "zod";
import { EstuaryMongoTypes } from '../shared/general.js';
import { ZodObjectSchema, GeneralRecord } from './utility-types.js';

export class SchemaParseError<T> extends Error {
  constructor(safeParseError: z.SafeParseError<T>) {
    const formattedError = safeParseError.error.format();
    super(JSON.stringify(formattedError, null, 2));
    this.name = 'SchemaParseError';
  }
}
/**
 * parse and throw a concise SchemaParseError if it fails. Currently doesn't preserve type inferences
 * todo: 
 * replace this placeholder function by modifying Zod's error map
 */
export function parseWithConciseError(
  schema: ZodObjectSchema | ZodArray<ZodObjectSchema>,
  input: unknown,
): z.infer<typeof schema> {
  const safeParseResult = schema.safeParse(input);
  if (!safeParseResult.success) {
    throw new SchemaParseError(safeParseResult);
  }

  return safeParseResult.data;
}
export class DocumentNotFoundError extends Error {
  constructor(query: GeneralRecord) {
    super(`Document not found matching ${JSON.stringify(query)}`);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentUpdateFailedError extends Error {
  constructor(id: string) {
    super(`Failed to modify document with id ${id}`);
    this.name = 'DocumentUpdateFailedError';
  }
}
