export function formatInvoiceDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildInvoiceNumberPrefix(date = new Date()): string {
  return `INV-${formatInvoiceDate(date)}-`;
}

export function buildInvoiceNumber(prefix: string, sequence: number): string {
  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

export function parseInvoiceSequence(invoiceNumber: string, prefix: string): number | null {
  if (!invoiceNumber.startsWith(prefix)) {
    return null;
  }

  const sequencePart = invoiceNumber.slice(prefix.length);
  const sequence = Number.parseInt(sequencePart, 10);

  if (!Number.isFinite(sequence) || sequence < 1) {
    return null;
  }

  return sequence;
}

export function getNextInvoiceSequence(
  latestInvoiceNumber: string | null | undefined,
  prefix: string,
): number {
  if (!latestInvoiceNumber) {
    return 1;
  }

  const currentSequence = parseInvoiceSequence(latestInvoiceNumber, prefix);
  return currentSequence ? currentSequence + 1 : 1;
}
