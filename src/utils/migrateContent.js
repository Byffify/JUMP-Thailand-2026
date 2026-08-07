import { CONTENT_VERSION, createEmptyBody, isValidOutputType } from "../data/schemas.js";

function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const ENVELOPE_KEYS = new Set(["id", "version", "createdAt", "metadata", "body"]);

export function isV1Record(record) {
  if (!isPlainObject(record)) {
    return false;
  }
  return (
    typeof record.version === "number" &&
    isPlainObject(record.metadata)
  );
}

export function migrateRecord(record) {
  if (!isPlainObject(record)) {
    return { version: CONTENT_VERSION, metadata: {}, body: {} };
  }
  if (isV1Record(record)) {
    return record;
  }

  const outputType = record.outputType;
  const knownType = isValidOutputType(outputType);

  let body;
  if (knownType && record.body == null) {
    body = createEmptyBody(outputType);
  } else if (
    record.body == null ||
    typeof record.body !== "object" ||
    Array.isArray(record.body)
  ) {
    body = {};
  } else {
    body = record.body;
  }

  const metadata = { source: "legacy" };
  for (const key of ["prompt", "subject", "grade", "outputType"]) {
    if (record[key] !== undefined && record[key] !== null) {
      metadata[key] = record[key];
    }
  }

  const envelope = { version: CONTENT_VERSION };
  if (record.id !== undefined && record.id !== null) {
    envelope.id = record.id;
  }
  if (
    record.createdAt !== undefined &&
    record.createdAt !== null &&
    typeof record.createdAt === "number"
  ) {
    envelope.createdAt = record.createdAt;
  } else {
    envelope.createdAt = Date.now();
  }
  envelope.metadata = metadata;
  envelope.body = body;

  for (const [key, value] of Object.entries(record)) {
    if (!ENVELOPE_KEYS.has(key)) {
      envelope[key] = value;
    }
  }

  return envelope;
}

export function migrateList(list) {
  return list.map(migrateRecord);
}