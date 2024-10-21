import mongoose from "mongoose";

export const connectToDB = async () => {
  const uri: string | undefined = process.env.MONGO_URI;
  const options = {
    directConnection: true,
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  if (typeof uri === "string") {
    await mongoose.connect(uri, options);
    console.log("Connected to Mongo");
  } else {
    console.error(
      "Could not connect to Mongo. Please ensure the URI is valid."
    );
  }
};
