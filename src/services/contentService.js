import { storage } from "./storageAdapter.js";
import { migrateList, migrateRecord } from "../utils/migrateContent.js";

const KEY = "contents";

async function readAll() {
  return storage.get(KEY, []);
}

export const contentService = {
  async create(item) {
    const list = await readAll();
    const record = migrateRecord(item);
    record.id = record.id ?? crypto.randomUUID();
    record.createdAt = record.createdAt ?? Date.now();
    list.push(record);
    await storage.set(KEY, list);
    return record;
  },
  async get(id) {
    const list = await readAll();
    const found = list.find((c) => c.id === id) ?? null;
    return found ? migrateRecord(found) : null;
  },
  async list() {
    const list = await readAll();
    return migrateList(list).sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    );
  },
  async update(id, patch) {
    const list = await readAll();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = migrateRecord({ ...list[idx], ...patch, id });
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