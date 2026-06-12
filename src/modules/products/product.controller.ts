import type { FastifyReply, FastifyRequest } from "fastify";
import {
  messageResponse,
  paginatedResponse,
  successResponse,
} from "../../utils/response.js";
import type { ProductService } from "./product.service.js";
import type {
  CreateProductInput,
  ProductIdParam,
  ProductListQuery,
  UpdateProductInput,
} from "./validation/product.validation.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const product = await this.productService.create(request.body);
    reply.status(201).send(successResponse(product));
  };

  list = async (
    request: FastifyRequest<{ Querystring: ProductListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.productService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };

  getById = async (
    request: FastifyRequest<{ Params: ProductIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const product = await this.productService.getById(request.params.id);
    reply.send(successResponse(product));
  };

  update = async (
    request: FastifyRequest<{
      Params: ProductIdParam;
      Body: UpdateProductInput;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const product = await this.productService.update(
      request.params.id,
      request.body,
    );
    reply.send(successResponse(product));
  };

  delete = async (
    request: FastifyRequest<{ Params: ProductIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.productService.delete(request.params.id);
    reply.send(messageResponse("Product deleted successfully"));
  };
}
