import type { PaginationMeta } from "../../../utils/pagination.js";

export interface PaymentCustomerDto {
  id: string;
  name: string;
  phone: string;
}

export interface PaymentDto {
  id: string;
  customerId: string;
  customer: PaymentCustomerDto;
  amount: string;
  paymentDate: Date;
  notes: string | null;
  outstandingBalanceAfter?: string;
}

export interface PaginatedPaymentsDto {
  items: PaymentDto[];
  meta: PaginationMeta;
}
