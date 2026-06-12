import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateInvoiceTotals,
  calculateLineAmount,
  roundMoney,
} from "./invoice-calculator.js";
import {
  buildInvoiceNumber,
  buildInvoiceNumberPrefix,
  getNextInvoiceSequence,
} from "./invoice-number.generator.js";

describe("invoice-calculator", () => {
  it("calculates line amount with rounding", () => {
    assert.equal(calculateLineAmount(2.5, 10.55), 26.38);
  });

  it("calculates invoice totals with discount and tax", () => {
    const totals = calculateInvoiceTotals(
      [
        { productId: "p1", quantity: 2, unitPrice: 100, amount: 200 },
        { productId: "p2", quantity: 1, unitPrice: 50, amount: 50 },
      ],
      20,
      11.5,
    );

    assert.equal(totals.subtotal, 250);
    assert.equal(totals.discount, 20);
    assert.equal(totals.tax, 11.5);
    assert.equal(totals.total, 241.5);
  });

  it("rounds money to two decimal places", () => {
    assert.equal(roundMoney(10.005), 10.01);
  });
});

describe("invoice-number.generator", () => {
  it("builds daily invoice number prefix", () => {
    const prefix = buildInvoiceNumberPrefix(new Date("2026-06-11T10:00:00Z"));
    assert.equal(prefix, "INV-20260611-");
  });

  it("builds padded invoice numbers", () => {
    assert.equal(buildInvoiceNumber("INV-20260611-", 7), "INV-20260611-0007");
  });

  it("increments sequence from latest invoice number", () => {
    const prefix = "INV-20260611-";
    assert.equal(
      getNextInvoiceSequence("INV-20260611-0009", prefix),
      10,
    );
    assert.equal(getNextInvoiceSequence(null, prefix), 1);
  });
});
