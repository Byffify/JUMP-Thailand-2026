import { storage } from "./storageAdapter.js";

const KEY = "chat_history";

export const chatService = {
  async list() {
    return storage.get(KEY, []);
  },
  async append(message) {
    const list = await storage.get(KEY, []);
    list.push(message);
    await storage.set(KEY, list);
    return list;
  },
  async replaceAll(messages) {
    await storage.set(KEY, messages);
    return messages;
  },
  async clear() {
    await storage.del(KEY);
  },
};