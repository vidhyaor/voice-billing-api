import type { PaginationMeta } from "../../../utils/pagination.js";

export interface CustomerDto {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  outstandingBalance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedCustomersDto {
  items: CustomerDto[];
  meta: PaginationMeta;
}

export interface CreditSaleDto {
  id: string;
  invoiceNumber: string;
  total: string;
  status: string;
  paymentType: string;
  createdAt: Date;
}

export interface PaymentHistoryItemDto {
  id: string;
  amount: string;
  paymentDate: Date;
  notes: string | null;
}

export interface CustomerLedgerSummaryDto {
  totalCreditSales: string;
  totalPaymentsCollected: string;
  outstandingBalance: string;
  creditInvoiceCount: number;
  paymentCount: number;
}

export interface CustomerLedgerDto extends CustomerDto {
  summary: CustomerLedgerSummaryDto;
  creditSales: CreditSaleDto[];
  paymentHistory: PaymentHistoryItemDto[];
}
