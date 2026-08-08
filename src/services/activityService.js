import { storage } from "./storageAdapter.js";

const KEY = "recent_activity";
const MAX = 10;

export const activityService = {
  async track(entry) {
    const list = await storage.get(KEY, []);
    const record = {
      ...entry,
      id: entry.id ?? crypto.randomUUID(),
      createdAt: entry.createdAt ?? Date.now(),
    };
    list.unshift(record);
    await storage.set(KEY, list.slice(0, MAX));
    return record;
  },
  async listRecent(limit = 6) {
    const list = await storage.get(KEY, []);
    return list.slice(0, limit);
  },
};