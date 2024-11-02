import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll } from "vitest";
import { populateMockDB } from "./featureFlags.mock.js";
import mongoose from "mongoose";

export const useMockDB = () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await populateMockDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  return () => mongoServer; // return via arrow-function to access the server in real-time during the tests
};
