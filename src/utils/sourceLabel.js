const SOURCE_LABELS = {
  gemini: "AI",
  template: "เทมเพลต",
  legacy: "Legacy",
};

export function sourceLabel(source) {
  if (typeof source !== "string") {
    return null;
  }
  return SOURCE_LABELS[source] ?? null;
}