// Cache service for efficient text processing
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // Maximum number of items to cache
    this.initializeCache();
  }

  async initializeCache() {
    try {
      const stored = await chrome.storage.local.get('sensitiveDataCache');
      if (stored.sensitiveDataCache) {
        this.cache = new Map(JSON.parse(stored.sensitiveDataCache));
      }
    } catch (error) {
      console.error('Cache initialization error:', error);
    }
  }

  // Generate a unique hash for the input text
  generateHash(text) {
    return Array.from(text)
      .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(36);
  }

  // Get cached result for text
  getCached(text) {
    const hash = this.generateHash(text);
    return this.cache.get(hash);
  }

  // Store result in cache
  async setCached(text, result) {
    const hash = this.generateHash(text);
    
    // Implement LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(hash, result);
    
    // Persist to chrome.storage
    try {
      await chrome.storage.local.set({
        sensitiveDataCache: JSON.stringify(Array.from(this.cache.entries()))
      });
    } catch (error) {
      console.error('Cache persistence error:', error);
    }
  }

  // Clear cache
  async clearCache() {
    this.cache.clear();
    await chrome.storage.local.remove('sensitiveDataCache');
  }
}

export default new CacheService();
