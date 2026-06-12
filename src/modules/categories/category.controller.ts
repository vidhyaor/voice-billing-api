import type { FastifyReply, FastifyRequest } from "fastify";
import { messageResponse, paginatedResponse, successResponse } from "../../utils/response.js";
import type { CategoryService } from "./category.service.js";
import type {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";
import type { IdParam } from "../../schemas/pagination.schema.js";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateCategoryInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const category = await this.categoryService.create(request.body);
    reply.status(201).send(successResponse(category));
  };

  getById = async (
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const category = await this.categoryService.getById(request.params.id);
    reply.send(successResponse(category));
  };

  list = async (
    request: FastifyRequest<{ Querystring: CategoryListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.categoryService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };

  update = async (
    request: FastifyRequest<{ Params: IdParam; Body: UpdateCategoryInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const category = await this.categoryService.update(
      request.params.id,
      request.body,
    );
    reply.send(successResponse(category));
  };

  delete = async (
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.categoryService.delete(request.params.id);
    reply.send(messageResponse("Category deleted successfully"));
  };
}
