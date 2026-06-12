import type { Prisma, PrismaClient, ProductAlias } from "@prisma/client";
import type {
  AliasSortField,
  CreateProductAliasInput,
  SortOrder,
  UpdateProductAliasInput,
} from "./validation/product-alias.validation.js";

const productAliasInclude = {
  product: {
    select: {
      id: true,
      productCode: true,
      name: true,
    },
  },
} satisfies Prisma.ProductAliasInclude;

export type ProductAliasWithProduct = Prisma.ProductAliasGetPayload<{
  include: typeof productAliasInclude;
}>;

export interface ProductAliasListFilters {
  productId?: string;
  q?: string;
}

export interface ProductAliasListOptions {
  filters: ProductAliasListFilters;
  skip: number;
  take: number;
  sortBy: AliasSortField;
  sortOrder: SortOrder;
}

export class ProductAliasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<ProductAliasWithProduct | null> {
    return this.prisma.productAlias.findUnique({
      where: { id },
      include: productAliasInclude,
    });
  }

  findByAlias(alias: string): Promise<ProductAlias | null> {
    return this.prisma.productAlias.findUnique({
      where: { alias },
    });
  }

  productExists(productId: string): Promise<boolean> {
    return this.prisma.product
      .findUnique({
        where: { id: productId },
        select: { id: true },
      })
      .then((product) => product !== null);
  }

  create(data: CreateProductAliasInput): Promise<ProductAliasWithProduct> {
    return this.prisma.productAlias.create({
      data: {
        alias: data.alias,
        productId: data.productId,
      },
      include: productAliasInclude,
    });
  }

  update(
    id: string,
    data: UpdateProductAliasInput,
  ): Promise<ProductAliasWithProduct> {
    return this.prisma.productAlias.update({
      where: { id },
      data: {
        ...(data.alias !== undefined && { alias: data.alias }),
        ...(data.productId !== undefined && { productId: data.productId }),
      },
      include: productAliasInclude,
    });
  }

  delete(id: string): Promise<ProductAlias> {
    return this.prisma.productAlias.delete({ where: { id } });
  }

  findMany(
    options: ProductAliasListOptions,
  ): Promise<[ProductAliasWithProduct[], number]> {
    const where = this.buildWhere(options.filters);
    const orderBy = { [options.sortBy]: options.sortOrder } as Prisma.ProductAliasOrderByWithRelationInput;

    return Promise.all([
      this.prisma.productAlias.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: productAliasInclude,
        orderBy,
      }),
      this.prisma.productAlias.count({ where }),
    ]);
  }

  private buildWhere(
    filters: ProductAliasListFilters,
  ): Prisma.ProductAliasWhereInput {
    const where: Prisma.ProductAliasWhereInput = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.q) {
      where.alias = { contains: filters.q };
    }

    return where;
  }
}
