import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { VoiceController } from "./voice.controller.js";
import { VoiceService } from "./voice.service.js";
import { voiceProcessSchema } from "./validation/voice.validation.js";

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
  const voiceService = new VoiceService(fastify);
  const voiceController = new VoiceController(voiceService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/process",
    {
      preHandler: [validate(voiceProcessSchema)],
      schema: {
        tags: ["Voice"],
        summary: "Process voice text and return fuzzy product matches",
        security: [{ bearerAuth: [] }],
      },
    },
    voiceController.process,
  );
};

export default voiceRoutes;
