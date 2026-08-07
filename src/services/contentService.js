import { storage } from "./storageAdapter.js";

const KEY = "contents";

async function readAll() {
  return storage.get(KEY, []);
}

export const contentService = {
  async create(item) {
    const list = await readAll();
    const record = {
      ...item,
      id: item.id ?? crypto.randomUUID(),
      createdAt: item.createdAt ?? Date.now(),
    };
    list.push(record);
    await storage.set(KEY, list);
    return record;
  },
  async get(id) {
    const list = await readAll();
    return list.find((c) => c.id === id) ?? null;
  },
  async list() {
    const list = await readAll();
    return [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
  async update(id, patch) {
    const list = await readAll();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...patch, id };
    list[idx] = updated;
    await storage.set(KEY, list);
    return updated;
  },
  async remove(id) {
    const list = await readAll();
    await storage.set(
      KEY,
      list.filter((c) => c.id !== id),
    );
  },
};