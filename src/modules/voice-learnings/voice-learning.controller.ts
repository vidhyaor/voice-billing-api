import type { FastifyReply, FastifyRequest } from "fastify";
import {
  messageResponse,
  paginatedResponse,
  successResponse,
} from "../../utils/response.js";
import type { VoiceLearningService } from "./voice-learning.service.js";
import type {
  UpdateVoiceLearningInput,
  VoiceLearningIdParam,
  VoiceLearningListQuery,
} from "./validation/voice-learning.validation.js";

export class VoiceLearningController {
  constructor(private readonly voiceLearningService: VoiceLearningService) {}

  list = async (
    request: FastifyRequest<{ Querystring: VoiceLearningListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.voiceLearningService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };

  update = async (
    request: FastifyRequest<{
      Params: VoiceLearningIdParam;
      Body: UpdateVoiceLearningInput;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const learning = await this.voiceLearningService.update(
      request.params.id,
      request.body,
    );
    reply.send(successResponse(learning));
  };

  delete = async (
    request: FastifyRequest<{ Params: VoiceLearningIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.voiceLearningService.delete(request.params.id);
    reply.send(messageResponse("Voice learning deleted successfully"));
  };
}
