import { storage } from "./storageAdapter.js";

const KEY = "settings";

export const settingsService = {
  async get() {
    return storage.get(KEY, {});
  },
  async getTheme() {
    const settings = await storage.get(KEY, {});
    return settings.theme ?? null;
  },
  async setTheme(theme) {
    const settings = await storage.get(KEY, {});
    await storage.set(KEY, { ...settings, theme });
  },
  async update(patch) {
    const settings = await storage.get(KEY, {});
    await storage.set(KEY, { ...settings, ...patch });
  },
};