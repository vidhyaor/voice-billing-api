export interface InvoiceLineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineAmount(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

export function calculateInvoiceTotals(
  lineItems: InvoiceLineItem[],
  discount: number,
  tax: number,
): InvoiceTotals {
  const subtotal = roundMoney(
    lineItems.reduce((sum, item) => sum + item.amount, 0),
  );
  const total = roundMoney(subtotal - discount + tax);

  return {
    subtotal,
    discount: roundMoney(discount),
    tax: roundMoney(tax),
    total,
  };
}
