import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { VoiceLearningController } from "./voice-learning.controller.js";
import { VoiceLearningService } from "./voice-learning.service.js";
import {
  updateVoiceLearningSchema,
  voiceLearningIdParamSchema,
  voiceLearningListQuerySchema,
} from "./validation/voice-learning.validation.js";

const voiceLearningRoutes: FastifyPluginAsync = async (fastify) => {
  const voiceLearningService = new VoiceLearningService(fastify);
  const voiceLearningController = new VoiceLearningController(
    voiceLearningService,
  );

  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/",
    {
      preHandler: [validate(voiceLearningListQuerySchema, "query")],
      schema: {
        tags: ["Voice Learning"],
        summary: "List voice learning mappings with pagination and filters",
        security: [{ bearerAuth: [] }],
      },
    },
    voiceLearningController.list,
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        validate(voiceLearningIdParamSchema, "params"),
        validate(updateVoiceLearningSchema),
      ],
      schema: {
        tags: ["Voice Learning"],
        summary: "Update voice learning mapping by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    voiceLearningController.update,
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [validate(voiceLearningIdParamSchema, "params")],
      schema: {
        tags: ["Voice Learning"],
        summary: "Delete voice learning mapping by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    voiceLearningController.delete,
  );
};

export default voiceLearningRoutes;
