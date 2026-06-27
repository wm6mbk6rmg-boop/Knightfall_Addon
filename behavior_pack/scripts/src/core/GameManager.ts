/**
 * GameManager - Main orchestrator for Knightfall addon
 * Initializes all core systems and manages game lifecycle
 * @module core/GameManager
 */

import { world, system } from "@minecraft/server";
import { EventBus } from "./EventBus";
import { Logger, LogLevel } from "./Logger";
import { ConfigManager } from "./ConfigManager";
import { ServiceRegistry, Service } from "./ServiceRegistry";
import { SaveManager } from "./SaveManager";
import { CooldownManager } from "./CooldownManager";

/**
 * Singleton game manager for Knightfall addon
 * Orchestrates initialization, game loop, and shutdown
 */
export class GameManager implements Service {
  private static instance: GameManager;
  private eventBus: EventBus;
  private logger: Logger;
  private configManager: ConfigManager;
  private serviceRegistry: ServiceRegistry;
  private saveManager: SaveManager;
  private cooldownManager: CooldownManager;
  private isInitialized: boolean = false;
  private gameLoopTickId: number | null = null;
  private tickCount: number = 0;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.serviceRegistry = ServiceRegistry.getInstance();
    this.saveManager = SaveManager.getInstance();
    this.cooldownManager = new CooldownManager();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Initialize all core systems
   * Implements Service interface
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn("GameManager", "Already initialized");
      return;
    }

    try {
      this.logger.info(
        "GameManager",
        "Initializing Knightfall core systems..."
      );

      // Initialize save manager
      await this.saveManager.initialize();
      this.logger.debug("GameManager", "SaveManager initialized");

      // Initialize all registered services
      await this.serviceRegistry.initializeAll();
      this.logger.debug("GameManager", "All services initialized");

      // Start game loop
      this.startGameLoop();

      this.isInitialized = true;
      this.eventBus.emit("game:initialized");
      this.logger.info("GameManager", "Knightfall initialized successfully");
    } catch (error) {
      this.logger.error("GameManager", "Initialization failed", error);
      throw error;
    }
  }

  /**
   * Start the main game loop
   * Runs every tick with system.runInterval
   */
  private startGameLoop(): void {
    this.gameLoopTickId = system.runInterval(() => {
      try {
        this.tickCount++;

        // Update cooldowns
        this.cooldownManager.update();

        // Emit tick event for systems to hook into
        this.eventBus.emit("game:tick", { tick: this.tickCount });

        // Periodic maintenance (every 100 ticks = ~5 seconds at 20 ticks/sec)
        if (this.tickCount % 100 === 0) {
          this.eventBus.emit("game:maintenance");
          this.saveManager.flush().catch((error) => {
            this.logger.warn("GameManager", "Failed to flush saves", error);
          });
        }
      } catch (error) {
        this.logger.error("GameManager", "Error in game loop", error);
      }
    }, 1);
  }

  /**
   * Shutdown all systems
   * Implements Service interface
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      this.logger.info("GameManager", "Shutting down Knightfall...");

      // Stop game loop
      if (this.gameLoopTickId !== null) {
        system.clearRun(this.gameLoopTickId);
        this.gameLoopTickId = null;
      }

      // Flush save data
      await this.saveManager.shutdown();

      // Shutdown all services
      await this.serviceRegistry.shutdownAll();

      // Clear cooldowns
      this.cooldownManager.clear();

      // Clear events
      this.eventBus.clear();

      this.isInitialized = false;
      this.tickCount = 0;
      this.eventBus.emit("game:shutdown");
      this.logger.info("GameManager", "Knightfall shutdown complete");
    } catch (error) {
      this.logger.error("GameManager", "Shutdown failed", error);
    }
  }

  /**
   * Get EventBus instance
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get Logger instance
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get ConfigManager instance
   */
  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * Get ServiceRegistry instance
   */
  public getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Get SaveManager instance
   */
  public getSaveManager(): SaveManager {
    return this.saveManager;
  }

  /**
   * Get CooldownManager instance
   */
  public getCooldownManager(): CooldownManager {
    return this.cooldownManager;
  }

  /**
   * Check if game is initialized and ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Set logging level
   */
  public setLogLevel(level: LogLevel): void {
    this.logger.setLevel(level);
  }

  /**
   * Get current tick count
   */
  public getTickCount(): number {
    return this.tickCount;
  }
}

export default GameManager;
