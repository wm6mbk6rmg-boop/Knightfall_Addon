/**
 * Knightfall - Main Entry Point
 * Initializes the Batman gameplay addon for Minecraft Bedrock Edition 1.21+
 * @module main
 */

import { world, system } from "@minecraft/server";
import GameManager from "./core/GameManager";
import { Logger, LogLevel } from "./core/Logger";
import { EventBus } from "./core/EventBus";
import { ConfigManager } from "./core/ConfigManager";
import { ServiceRegistry } from "./core/ServiceRegistry";
import { SaveManager } from "./core/SaveManager";
import { CooldownManager } from "./core/CooldownManager";

// ============================================================================
// CORE SYSTEM INITIALIZATION
// ============================================================================

const gameManager = GameManager.getInstance();
const logger = Logger.getInstance();
const eventBus = EventBus.getInstance();
const configManager = ConfigManager.getInstance();
const serviceRegistry = ServiceRegistry.getInstance();
const saveManager = SaveManager.getInstance();
const cooldownManager = new CooldownManager();

// Set logging level for development (change to WARNING for production)
logger.setLevel(LogLevel.DEBUG);

// ============================================================================
// MINECRAFT EVENT HANDLERS
// ============================================================================

/**
 * Initialize on world load
 */
world.afterEvents.worldInitialize.subscribe(async () => {
  try {
    logger.info("Main", "World initialized, starting Knightfall...");
    await gameManager.initialize();
  } catch (error) {
    logger.error("Main", "Failed to initialize Knightfall", error);
  }
});

/**
 * Handle player spawn/join
 */
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  try {
    logger.info("Main", `Player '${player.name}' joined`, {
      playerId: player.id,
    });
    eventBus.emit("player:joined", { player, dimension: player.dimension });
  } catch (error) {
    logger.error("Main", `Error handling player spawn for ${player.name}`, error);
  }
});

/**
 * Handle player leave
 */
world.afterEvents.playerLeave.subscribe((event) => {
  const player = event.player;
  try {
    logger.info("Main", `Player '${player.name}' left`, { playerId: player.id });
    eventBus.emit("player:left", { player, playerId: player.id });
  } catch (error) {
    logger.error("Main", `Error handling player leave for ${player.name}`, error);
  }
});

/**
 * Handle entity death
 */
world.afterEvents.entityDie.subscribe((event) => {
  try {
    const victim = event.deadEntity;
    const damageSource = event.damageSource;
    eventBus.emit("entity:died", {
      victim,
      damageSource,
      killerEntity: damageSource.damagingEntity,
    });
  } catch (error) {
    logger.error("Main", "Error handling entity death", error);
  }
});

/**
 * Handle entity damage
 */
world.afterEvents.entityHurt.subscribe((event) => {
  try {
    const victim = event.hurtEntity;
    const damage = event.damage;
    const damageSource = event.damageSource;
    eventBus.emit("entity:hurt", {
      victim,
      damage,
      damageSource,
      damageType: damageSource.cause,
    });
  } catch (error) {
    logger.error("Main", "Error handling entity hurt", error);
  }
});

/**
 * Handle item use
 */
world.afterEvents.itemUse.subscribe((event) => {
  try {
    const source = event.source;
    const itemStack = event.itemStack;
    eventBus.emit("item:used", {
      player: source,
      item: itemStack,
      position: source.location,
    });
  } catch (error) {
    logger.error("Main", "Error handling item use", error);
  }
});

/**
 * Handle block break
 */
world.afterEvents.blockBreak.subscribe((event) => {
  try {
    const player = event.player;
    const block = event.brokenBlockPermutation;
    const dimension = event.dimension;
    eventBus.emit("block:broken", {
      player,
      block,
      dimension,
      location: { x: block.x, y: block.y, z: block.z },
    });
  } catch (error) {
    logger.error("Main", "Error handling block break", error);
  }
});

/**
 * Handle block place
 */
world.afterEvents.blockPlace.subscribe((event) => {
  try {
    const player = event.player;
    const block = event.block;
    const dimension = event.dimension;
    eventBus.emit("block:placed", {
      player,
      block,
      dimension,
      location: block.location,
    });
  } catch (error) {
    logger.error("Main", "Error handling block place", error);
  }
});

// ============================================================================
// GLOBAL ERROR HANDLING
// ============================================================================

/**
 * Handle uncaught exceptions
 */
function setupErrorHandling(): void {
  process.on("uncaughtException", (error: any) => {
    logger.error("Main", "Uncaught exception in addon", error);
  });
}

setupErrorHandling();

// ============================================================================
// INITIALIZATION COMPLETE
// ============================================================================

logger.info(
  "Main",
  "Knightfall addon loaded successfully - awaiting world initialization"
);
