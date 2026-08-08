import {
  OUTPUT_TYPES,
  OUTPUT_SCHEMAS,
  SOURCES,
  CONTENT_VERSION,
} from "../data/schemas.js";

function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function typeMatches(value, type) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "array":
      return Array.isArray(value);
    case "object":
      return isPlainObject(value);
    default:
      return false;
  }
}

function validateItem(item, descriptor, path) {
  const errors = [];
  if (descriptor.itemType === "object" && descriptor.itemShape) {
    if (!isPlainObject(item)) {
      errors.push(`Item at ${path} must be an object`);
      return errors;
    }
    for (const sub of descriptor.itemShape) {
      if (!(sub.name in item)) {
        if (sub.required) {
          errors.push(`Item at ${path} missing required field "${sub.name}"`);
        }
        continue;
      }
      if (!typeMatches(item[sub.name], sub.type)) {
        errors.push(`Item at ${path} field "${sub.name}" must be ${sub.type}`);
      }
    }
  } else if (!typeMatches(item, descriptor.itemType)) {
    errors.push(`Item at ${path} must be ${descriptor.itemType}`);
  }
  return errors;
}

export function validateBody(outputType, obj) {
  const schema = OUTPUT_SCHEMAS[outputType];
  if (!schema) {
    return { valid: false, errors: [`Unknown outputType: ${String(outputType)}`] };
  }
  if (!isPlainObject(obj)) {
    return { valid: false, errors: ["body must be a plain object"] };
  }

  const errors = [];
  for (const field of schema.fields) {
    if (!(field.name in obj)) {
      if (field.required) {
        errors.push(`Missing required field "${field.name}"`);
      }
      continue;
    }
    const value = obj[field.name];
    if (field.type === "array") {
      if (!Array.isArray(value)) {
        errors.push(`Field "${field.name}" must be an array`);
        continue;
      }
      value.forEach((item, index) => {
        const itemErrors = validateItem(item, field, `${field.name}[${index}]`);
        errors.push(...itemErrors);
      });
    } else if (!typeMatches(value, field.type)) {
      errors.push(`Field "${field.name}" must be ${field.type}`);
    }
  }

  if (
    outputType === "quiz" &&
    Array.isArray(obj.items) &&
    obj.items.length > 15
  ) {
    errors.push(`Field "items" must have at most 15 items (got ${obj.items.length})`);
  }

  const valid = errors.length === 0;
  if (valid) {
    return { valid, errors, normalized: obj };
  }
  return { valid, errors };
}

export function validateContentRecord(record) {
  if (!isPlainObject(record)) {
    return { valid: false, errors: ["record must be a plain object"] };
  }

  const errors = [];

  if (typeof record.id !== "string" || record.id.length === 0) {
    errors.push("id must be a non-empty string");
  }

  if (!Number.isInteger(record.version) || record.version !== CONTENT_VERSION) {
    errors.push(`version must be integer ${CONTENT_VERSION}`);
  }

  if (
    typeof record.createdAt !== "number" ||
    !Number.isFinite(record.createdAt)
  ) {
    errors.push("createdAt must be a finite number");
  }

  const metadata = record.metadata;
  if (!isPlainObject(metadata)) {
    errors.push("metadata must be a plain object");
    return { valid: false, errors };
  }

  const metadataFields = ["prompt", "subject", "grade", "outputType", "source"];
  for (const key of metadataFields) {
    if (typeof metadata[key] !== "string") {
      errors.push(`metadata.${key} must be a string`);
    }
  }

  if (!OUTPUT_TYPES.includes(metadata.outputType)) {
    errors.push(`metadata.outputType must be one of: ${OUTPUT_TYPES.join(", ")}`);
  } else {
    const bodyResult = validateBody(metadata.outputType, record.body);
    if (!bodyResult.valid) {
      for (const err of bodyResult.errors) {
        errors.push(`body: ${err}`);
      }
    }
  }

  if (!SOURCES.includes(metadata.source)) {
    errors.push(`metadata.source must be one of: ${SOURCES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}