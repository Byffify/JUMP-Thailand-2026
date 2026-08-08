export function extractJson(text) {
  if (typeof text !== "string" || text.trim().length === 0) return null;
  const source = text.trim();
  // 1. Try to find a fenced block (```json ... ``` or plain ``` ... ```).
  const fence = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : source;
  return tryParse(candidate) ?? tryParse(findBrace(candidate));
}

function tryParse(str) {
  if (typeof str !== "string") return null;
  try {
    const value = JSON.parse(str);
    return isPlainObject(value) ? value : null;
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function findBrace(str) {
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = str.slice(start, end + 1);
  // If the surrounding prose left unbalanced braces, better to fail parse than crash.
  return slice;
}
