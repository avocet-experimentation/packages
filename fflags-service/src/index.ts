import { buildServer } from "./buildServer.js";
import { connectToDB } from "./connectToDB.js";

const main = async (): Promise<void> => {
  try {
    const PORT = 3524; // spells flag on mobile phone keypad xD
    await connectToDB();
    const server = await buildServer();
    await server.listen({ port: PORT });
    console.log(`FFlag server ready at port ${PORT}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main().catch(console.log);
