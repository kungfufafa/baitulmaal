const normalizePayload = (payload: string): string =>
  payload.replace(/[\r\n\t]/g, '').trim();

type TlvEntry = {
  tag: string;
  value: string;
};

const parseTopLevelTlv = (payload: string): TlvEntry[] => {
  const entries: TlvEntry[] = [];
  let cursor = 0;

  while (cursor + 4 <= payload.length) {
    const tag = payload.slice(cursor, cursor + 2);
    cursor += 2;

    const rawLength = payload.slice(cursor, cursor + 2);
    if (!/^\d{2}$/.test(rawLength)) {
      throw new Error('Invalid QRIS payload length segment.');
    }
    cursor += 2;

    const length = Number(rawLength);
    const valueEnd = cursor + length;
    if (valueEnd > payload.length) {
      throw new Error('QRIS payload is truncated.');
    }

    entries.push({
      tag,
      value: payload.slice(cursor, valueEnd),
    });

    cursor = valueEnd;
  }

  if (cursor !== payload.length) {
    throw new Error('QRIS payload format is invalid.');
  }

  return entries;
};

const upsertTag = (
  entries: TlvEntry[],
  tag: string,
  value: string,
  insertAfterTag?: string
): TlvEntry[] => {
  const updated = entries.map((entry) =>
    entry.tag === tag
      ? { ...entry, value }
      : entry
  );

  if (updated.some((entry) => entry.tag === tag)) {
    return updated;
  }

  if (!insertAfterTag) {
    return [...updated, { tag, value }];
  }

  const insertIndex = updated.findIndex((entry) => entry.tag === insertAfterTag);
  if (insertIndex === -1) {
    return [...updated, { tag, value }];
  }

  return [
    ...updated.slice(0, insertIndex + 1),
    { tag, value },
    ...updated.slice(insertIndex + 1),
  ];
};

const formatAmount = (amount: number): string => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('QRIS amount must be greater than zero.');
  }

  const fixed = amount.toFixed(2);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return trimmed || '0';
};

const buildTlv = (entries: TlvEntry[]): string => (
  entries.map((entry) => {
    const length = entry.value.length;
    if (length > 99) {
      throw new Error('QRIS payload tag value exceeds 99 characters.');
    }

    return `${entry.tag}${String(length).padStart(2, '0')}${entry.value}`;
  }).join('')
);

const crc16CcittFalse = (payload: string): string => {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const MAX_QRIS_AMOUNT = 100_000_000;

const validateStaticPayload = (entries: TlvEntry[], rawPayload: string): void => {
  const tag00 = entries.find((e) => e.tag === '00');
  if (!tag00) {
    throw new Error('QRIS payload missing Payload Format Indicator (tag 00).');
  }

  const crcEntry = entries.find((e) => e.tag === '63');
  if (crcEntry) {
    const payloadWithoutCrc = rawPayload.slice(0, rawPayload.length - 4);
    const expectedCrc = crc16CcittFalse(payloadWithoutCrc);
    if (expectedCrc !== crcEntry.value) {
      throw new Error('QRIS static payload CRC mismatch.');
    }
  }
};

export const generateDynamicQrisPayload = (staticPayload: string, amount: number): string => {
  const normalizedPayload = normalizePayload(staticPayload);
  if (!normalizedPayload) {
    throw new Error('QRIS static payload is empty.');
  }

  if (amount > MAX_QRIS_AMOUNT) {
    throw new Error(`QRIS amount exceeds maximum of ${MAX_QRIS_AMOUNT.toLocaleString()}.`);
  }

  const allEntries = parseTopLevelTlv(normalizedPayload);
  validateStaticPayload(allEntries, normalizedPayload);

  let entries = allEntries.filter((entry) => entry.tag !== '63');

  entries = upsertTag(entries, '01', '12', '00');
  entries = upsertTag(entries, '54', formatAmount(amount), '53');

  const payloadWithoutCrc = `${buildTlv(entries)}6304`;
  const crc = crc16CcittFalse(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
};
