import type { InvoiceStatus, PaymentType } from "@prisma/client";
import type { PaginationMeta } from "../../../utils/pagination.js";

export interface InvoiceCustomerDto {
  id: string;
  name: string;
  phone: string;
}

export interface InvoiceProductDto {
  id: string;
  name: string;
  productCode: string;
  unit: string;
}

export interface InvoiceItemDto {
  id: string;
  productId: string;
  product: InvoiceProductDto;
  quantity: string;
  unitPrice: string;
  amount: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: InvoiceCustomerDto;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentType: PaymentType;
  status: InvoiceStatus;
  items: InvoiceItemDto[];
  createdAt: Date;
}

export interface InvoiceListItemDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: InvoiceCustomerDto;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentType: PaymentType;
  status: InvoiceStatus;
  itemCount: number;
  createdAt: Date;
}

export interface PaginatedInvoicesDto {
  items: InvoiceListItemDto[];
  meta: PaginationMeta;
}
