import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { ProductController } from "./product.controller.js";
import { ProductService } from "./product.service.js";
import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
  updateProductSchema,
} from "./validation/product.validation.js";

const productRoutes: FastifyPluginAsync = async (fastify) => {
  const productService = new ProductService(fastify);
  const productController = new ProductController(productService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    {
      preHandler: [validate(createProductSchema)],
      schema: {
        tags: ["Products"],
        summary: "Create a new product",
        security: [{ bearerAuth: [] }],
      },
    },
    productController.create,
  );

  fastify.get(
    "/",
    {
      preHandler: [validate(productListQuerySchema, "query")],
      schema: {
        tags: ["Products"],
        summary:
          "List products with pagination, search, filters, and sorting",
        security: [{ bearerAuth: [] }],
      },
    },
    productController.list,
  );

  fastify.get(
    "/:id",
    {
      preHandler: [validate(productIdParamSchema, "params")],
      schema: {
        tags: ["Products"],
        summary: "Get product by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    productController.getById,
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        validate(productIdParamSchema, "params"),
        validate(updateProductSchema),
      ],
      schema: {
        tags: ["Products"],
        summary: "Update product by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    productController.update,
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [validate(productIdParamSchema, "params")],
      schema: {
        tags: ["Products"],
        summary: "Delete product by ID",
        security: [{ bearerAuth: [] }],
      },
    },
    productController.delete,
  );
};

export default productRoutes;
