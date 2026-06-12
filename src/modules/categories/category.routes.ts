import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { idParamSchema } from "../../schemas/pagination.schema.js";
import { CategoryController } from "./category.controller.js";
import {
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import { CategoryService } from "./category.service.js";

const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  const categoryService = new CategoryService(fastify);
  const categoryController = new CategoryController(categoryService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    { preHandler: [validate(createCategorySchema)], schema: { tags: ["Categories"], security: [{ bearerAuth: [] }] } },
    categoryController.create,
  );

  fastify.get(
    "/",
    { preHandler: [validate(categoryListQuerySchema, "query")], schema: { tags: ["Categories"], security: [{ bearerAuth: [] }] } },
    categoryController.list,
  );

  fastify.get(
    "/:id",
    { preHandler: [validate(idParamSchema, "params")], schema: { tags: ["Categories"], security: [{ bearerAuth: [] }] } },
    categoryController.getById,
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        validate(idParamSchema, "params"),
        validate(updateCategorySchema),
      ],
      schema: { tags: ["Categories"], security: [{ bearerAuth: [] }] },
    },
    categoryController.update,
  );

  fastify.delete(
    "/:id",
    { preHandler: [validate(idParamSchema, "params")], schema: { tags: ["Categories"], security: [{ bearerAuth: [] }] } },
    categoryController.delete,
  );
};

export default categoryRoutes;
