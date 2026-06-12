import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractQuantity,
  parseMalayalamNumber,
} from "./malayalam-number.service.js";

describe("parseMalayalamNumber", () => {
  it("parses basic Malayalam numbers", () => {
    assert.equal(parseMalayalamNumber("ഒന്ന്"), 1);
    assert.equal(parseMalayalamNumber("രണ്ട്"), 2);
    assert.equal(parseMalayalamNumber("മൂന്ന്"), 3);
    assert.equal(parseMalayalamNumber("നാല്"), 4);
    assert.equal(parseMalayalamNumber("അഞ്ച്"), 5);
    assert.equal(parseMalayalamNumber("ആറ്"), 6);
    assert.equal(parseMalayalamNumber("ഏഴ്"), 7);
    assert.equal(parseMalayalamNumber("എട്ട്"), 8);
    assert.equal(parseMalayalamNumber("ഒൻപത്"), 9);
    assert.equal(parseMalayalamNumber("പത്ത്"), 10);
  });

  it("parses teen and tens Malayalam numbers", () => {
    assert.equal(parseMalayalamNumber("പതിനൊന്ന്"), 11);
    assert.equal(parseMalayalamNumber("പന്ത്രണ്ട്"), 12);
    assert.equal(parseMalayalamNumber("ഇരുപത്"), 20);
    assert.equal(parseMalayalamNumber("മുപ്പത്"), 30);
    assert.equal(parseMalayalamNumber("നാൽപത്"), 40);
    assert.equal(parseMalayalamNumber("അമ്പത്"), 50);
    assert.equal(parseMalayalamNumber("നൂറ്"), 100);
  });

  it("parses compound Malayalam numbers", () => {
    assert.equal(parseMalayalamNumber("ഇരുപത്ത് അഞ്ച്"), 25);
    assert.equal(parseMalayalamNumber("ഇരുപത് അഞ്ച്"), 25);
    assert.equal(parseMalayalamNumber("മുപ്പത്ത് മൂന്ന്"), 33);
    assert.equal(parseMalayalamNumber("നാൽപത്ത് ഒൻപത്"), 49);
  });

  it("returns null for invalid Malayalam number text", () => {
    assert.equal(parseMalayalamNumber(""), null);
    assert.equal(parseMalayalamNumber("pvc pipe"), null);
    assert.equal(parseMalayalamNumber("ഇരുപത് pipe"), null);
  });
});

describe("extractQuantity", () => {
  it("extracts leading digit quantities", () => {
    const result = extractQuantity("5 pvc pipe twenty");

    assert.equal(result.quantity, 5);
    assert.equal(result.remainder, "pvc pipe twenty");
    assert.equal(result.source, "digit");
  });

  it("extracts Malayalam quantity from the start", () => {
    const result = extractQuantity("അഞ്ച് pvc pipe");

    assert.equal(result.quantity, 5);
    assert.equal(result.remainder, "pvc pipe");
    assert.equal(result.source, "malayalam");
  });

  it("extracts compound Malayalam quantity from the start", () => {
    const result = extractQuantity("ഇരുപത്ത് അഞ്ച് pipe");

    assert.equal(result.quantity, 25);
    assert.equal(result.remainder, "pipe");
    assert.equal(result.source, "malayalam");
  });

  it("extracts English word quantities", () => {
    const result = extractQuantity("twenty pvc pipe");

    assert.equal(result.quantity, 20);
    assert.equal(result.remainder, "pvc pipe");
    assert.equal(result.source, "english");
  });

  it("defaults to quantity 1 when no quantity is found", () => {
    const result = extractQuantity("pvc pipe twenty");

    assert.equal(result.quantity, 1);
    assert.equal(result.remainder, "pvc pipe twenty");
    assert.equal(result.source, "default");
  });

  it("handles Malayalam-only quantity input", () => {
    const result = extractQuantity("പത്ത്");

    assert.equal(result.quantity, 10);
    assert.equal(result.remainder, "");
    assert.equal(result.source, "malayalam");
  });

  it("handles decimal digit quantities", () => {
    const result = extractQuantity("2.5 kg cement");

    assert.equal(result.quantity, 2.5);
    assert.equal(result.remainder, "kg cement");
    assert.equal(result.source, "digit");
  });
});
