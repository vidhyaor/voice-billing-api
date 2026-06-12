import type { FastifyReply, FastifyRequest } from "fastify";
import {
  messageResponse,
  paginatedResponse,
  successResponse,
} from "../../utils/response.js";
import type { ProductAliasService } from "./product-alias.service.js";
import type {
  CreateProductAliasInput,
  ProductAliasIdParam,
  ProductAliasListQuery,
  UpdateProductAliasInput,
} from "./validation/product-alias.validation.js";

export class ProductAliasController {
  constructor(private readonly productAliasService: ProductAliasService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateProductAliasInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const alias = await this.productAliasService.create(request.body);
    reply.status(201).send(successResponse(alias));
  };

  list = async (
    request: FastifyRequest<{ Querystring: ProductAliasListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.productAliasService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };

  update = async (
    request: FastifyRequest<{
      Params: ProductAliasIdParam;
      Body: UpdateProductAliasInput;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const alias = await this.productAliasService.update(
      request.params.id,
      request.body,
    );
    reply.send(successResponse(alias));
  };

  delete = async (
    request: FastifyRequest<{ Params: ProductAliasIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.productAliasService.delete(request.params.id);
    reply.send(messageResponse("Product alias deleted successfully"));
  };
}
