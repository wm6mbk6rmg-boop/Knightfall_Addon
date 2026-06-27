/**
 * SaveManager - Persistent data storage using Minecraft world state
 * Handles serialization and retrieval of game state for entities and players
 * @module core/SaveManager
 */

export interface SaveData {
  [key: string]: string | number | boolean | object;
}

/**
 * Manages persistent data storage for Knightfall addon
 * Uses entity tags and dynamic properties where available
 * TODO: Implement full Bedrock 1.21+ dynamic property system when stable
 */
export class SaveManager {
  private static instance: SaveManager;
  private data: Map<string, SaveData> = new Map();
  private dirty: Set<string> = new Set();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Initialize save system
   */
  public async initialize(): Promise<void> {
    // TODO: Initialize dynamic properties when Bedrock API stabilizes
    console.log("[SaveManager] Initialized");
  }

  /**
   * Save data for an entity or player
   * @param entityId - Unique entity/player identifier
   * @param data - Data to save
   */
  public saveData(entityId: string, data: SaveData): void {
    this.data.set(entityId, { ...data });
    this.dirty.add(entityId);
  }

  /**
   * Load data for an entity or player
   * @param entityId - Unique identifier
   * @returns Saved data or null if not found
   */
  public loadData(entityId: string): SaveData | null {
    return this.data.get(entityId) || null;
  }

  /**
   * Delete saved data for an entity
   */
  public deleteData(entityId: string): void {
    this.data.delete(entityId);
    this.dirty.add(entityId);
  }

  /**
   * Check if data exists for entity
   */
  public hasData(entityId: string): boolean {
    return this.data.has(entityId);
  }

  /**
   * Flush dirty data to persistent storage
   * Called periodically during game loop
   */
  public async flush(): Promise<void> {
    // TODO: Persist to Bedrock world storage
    this.dirty.clear();
  }

  /**
   * Clear all in-memory data
   */
  public clear(): void {
    this.data.clear();
    this.dirty.clear();
  }

  /**
   * Shutdown and cleanup
   */
  public async shutdown(): Promise<void> {
    await this.flush();
    this.clear();
  }
}

export default SaveManager;
