import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { ProductAliasController } from "./product-alias.controller.js";
import { ProductAliasService } from "./product-alias.service.js";
import {
  createProductAliasSchema,
  productAliasIdParamSchema,
  productAliasListQuerySchema,
  updateProductAliasSchema,
} from "./validation/product-alias.validation.js";

const productAliasRoutes: FastifyPluginAsync = async (fastify) => {
  const productAliasService = new ProductAliasService(fastify);
  const productAliasController = new ProductAliasController(productAliasService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    {
      preHandler: [validate(createProductAliasSchema)],
      schema: {
        tags: ["Product Aliases"],
        summary: "Create a product alias",
        security: [{ bearerAuth: [] }],
      },
    },
    productAliasController.create,
  );

  fastify.get(
    "/",
    {
      preHandler: [validate(productAliasListQuerySchema, "query")],
      schema: {
        tags: ["Product Aliases"],
        summary: "List product aliases with pagination and filters",
        security: [{ bearerAuth: [] }],
      },
    },
    productAliasController.list,
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        validate(productAliasIdParamSchema, "params"),
        validate(updateProductAliasSchema),
      ],
      schema: {
        tags: ["Product Aliases"],
        summary: "Update product alias by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    productAliasController.update,
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [validate(productAliasIdParamSchema, "params")],
      schema: {
        tags: ["Product Aliases"],
        summary: "Delete product alias by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    productAliasController.delete,
  );
};

export default productAliasRoutes;
