import type { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response.js";
import type { VoiceService } from "./voice.service.js";
import type { VoiceProcessInput } from "./validation/voice.validation.js";

export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  process = async (
    request: FastifyRequest<{ Body: VoiceProcessInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.voiceService.process(request.body);
    reply.send(successResponse(result));
  };
}
