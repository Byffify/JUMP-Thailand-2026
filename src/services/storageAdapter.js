const PREFIX = "krumate:";

/**
 * Thin, Promise-based storage adapter over localStorage.
 * All persistence flows through here so swapping to an HTTP API later
 * only requires changing this one module.
 */
export const storage = {
  async get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (err) {
      console.warn(`storage.get("${key}") failed`, err);
      return fallback;
    }
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn(`storage.set("${key}") failed`, err);
    }
  },
  async del(key) {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.warn(`storage.del("${key}") failed`, err);
    }
  },
};