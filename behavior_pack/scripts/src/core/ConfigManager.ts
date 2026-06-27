/**
 * ConfigManager - Centralized gameplay constants and configuration
 * Provides single source of truth for all tunable values
 * @module core/ConfigManager
 */

export interface GameplayConfig {
  player: {
    defaultHealth: number;
    defaultArmor: number;
    maxHealth: number;
    maxArmor: number;
  };
  combat: {
    punchDamage: number;
    weaponDamage: number;
    knockbackMultiplier: number;
  };
  gadgets: {
    grapnelCooldown: number;
    grapnelRange: number;
    glideDuration: number;
  };
  mission: {
    objectiveUpdateInterval: number;
  };
  economy: {
    startingCurrency: number;
    maxCurrency: number;
  };
  performance: {
    maxActiveEnemies: number;
    entityUpdateInterval: number;
    aiTickRate: number;
  };
}

const DEFAULT_CONFIG: GameplayConfig = {
  player: {
    defaultHealth: 20,
    defaultArmor: 0,
    maxHealth: 20,
    maxArmor: 8,
  },
  combat: {
    punchDamage: 1,
    weaponDamage: 5,
    knockbackMultiplier: 1.0,
  },
  gadgets: {
    grapnelCooldown: 1000,
    grapnelRange: 50,
    glideDuration: 10,
  },
  mission: {
    objectiveUpdateInterval: 100,
  },
  economy: {
    startingCurrency: 100,
    maxCurrency: 10000,
  },
  performance: {
    maxActiveEnemies: 20,
    entityUpdateInterval: 5,
    aiTickRate: 10,
  },
};

/**
 * Singleton config manager for Knightfall addon
 * Manages all gameplay constants and tunable values
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: GameplayConfig = JSON.parse(
    JSON.stringify(DEFAULT_CONFIG)
  );

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get a configuration value by dot notation path
   * @example get("player.maxHealth")
   */
  public get<T = any>(path: string): T {
    const parts = path.split(".");
    let value: any = this.config;

    for (const part of parts) {
      value = value[part];
      if (value === undefined) {
        console.warn(`[ConfigManager] Config path not found: ${path}`);
        return undefined as T;
      }
    }

    return value as T;
  }

  /**
   * Set a configuration value by dot notation path
   */
  public set(path: string, value: any): void {
    const parts = path.split(".");
    let obj: any = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!obj[part]) obj[part] = {};
      obj = obj[part];
    }

    obj[parts[parts.length - 1]] = value;
  }

  /**
   * Get entire config object (copy)
   */
  public getConfig(): GameplayConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Reset to default config
   */
  public reset(): void {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  /**
   * Load custom config (merge with defaults)
   */
  public load(customConfig: Partial<GameplayConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }
}

export default ConfigManager;
