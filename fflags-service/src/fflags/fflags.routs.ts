import { FastifyInstance } from "fastify";
import {
  createFFlagHandler,
  deleteFFlagHandler,
  getAllFFlagsForCachingHandler,
  getFFlagByIdHandler,
  updateFFlagHandler,
} from "./fflags.controller.js";

// map http methods to the path and the handlers which are implemented in the controller
export const getFFlagsRoutes = async (
  server: FastifyInstance
): Promise<FastifyInstance> => {
  server.post("/", createFFlagHandler); // create new flag, including its environment and respective user groups
  server.put("/:fflagId", updateFFlagHandler); // update entire flag (do we need a patch method?)
  server.delete("/:fflagId", deleteFFlagHandler); // physically remove entire flag
  server.get("/:fflagId", getFFlagByIdHandler); // return flag by its id
  server.get("/caching/:environmentName", getAllFFlagsForCachingHandler); // used by REST loader; return flags in structure we are using to cache them in memory
  return server;
};
