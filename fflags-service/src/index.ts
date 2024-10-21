import { buildServer } from "./buildServer.js";
import { connectToDB } from "./connectToDB.js";

const main = async (): Promise<void> => {
  const PORT = process.env.SERVICE_PORT; // spells flag on mobile phone keypad xD
  if (typeof PORT === "number") {
    try {
      await connectToDB();
      const server = await buildServer();
      await server.listen({ port: PORT });
      console.log(`FFlag server ready at port ${PORT}`);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  } else {
    console.error(
      "Could not retrieve port number. Please ensure .env is configure properly"
    );
  }
};

main().catch(console.log);
