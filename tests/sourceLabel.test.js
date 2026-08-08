import { test } from "node:test";
import assert from "node:assert/strict";

import { sourceLabel } from "../src/utils/sourceLabel.js";

test("sourceLabel maps the three known sources", () => {
  assert.equal(sourceLabel("gemini"), "AI");
  assert.equal(sourceLabel("template"), "เทมเพลต");
  assert.equal(sourceLabel("legacy"), "Legacy");
});

test("sourceLabel returns null for unknown sources", () => {
  assert.equal(sourceLabel("unknown"), null);
  assert.equal(sourceLabel("video"), null);
  assert.equal(sourceLabel(""), null);
});

test("sourceLabel returns null for undefined/null/non-strings", () => {
  assert.equal(sourceLabel(undefined), null);
  assert.equal(sourceLabel(null), null);
  assert.equal(sourceLabel(42), null);
  assert.equal(sourceLabel({}), null);
});

test("sourceLabel never throws", () => {
  for (const value of [undefined, null, 0, "", "gemini", "template", "legacy", ["gemini"], {}, Symbol("x")]) {
    assert.doesNotThrow(() => sourceLabel(value));
  }
});
