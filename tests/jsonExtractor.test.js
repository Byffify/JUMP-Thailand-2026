import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson } from "../src/utils/jsonExtractor.js";

test("extracts fenced json", () => {
  const text = "Here:\n```json\n{\"title\":\"x\"}\n```\nthanks";
  assert.deepEqual(extractJson(text), { title: "x" });
});
test("extracts bare object in prose", () => {
  assert.deepEqual(extractJson('The result is {"a":1} end'), { a: 1 });
});
test("returns null on invalid json", () => {
  assert.equal(extractJson("not json at all"), null);
});
test("returns null on array root", () => {
  assert.equal(extractJson("[1,2,3]"), null);
});
test("handles nested quotes/escapes", () => {
  assert.deepEqual(extractJson('{"k":"v with \\"quote\\""}'), { k: 'v with "quote"' });
});
test("returns null for empty input", () => {
  assert.equal(extractJson(""), null);
});
