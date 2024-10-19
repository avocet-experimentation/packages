import fflagsMongoLoader from '../src/fflags-mongo-loader.js';
import { strict as assert } from 'assert';

assert.strictEqual(fflagsMongoLoader(), 'Hello from fflagsMongoLoader');
console.info('fflagsMongoLoader tests passed');
