import { z } from "zod";
import { EstuaryMongoTypes } from '../shared/general.js';
import { GeneralRecord } from './utility-types.js';

export class SchemaParseError<T extends EstuaryMongoTypes> extends Error {
  constructor(safeParseError: z.SafeParseError<T>) {
    const formattedError = safeParseError.error.format();
    console.log(
      'schema parse errors:',
      JSON.stringify(formattedError, null, 2),
    );
    super(String(formattedError));
    this.name = 'SchemaParseError';
  }
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