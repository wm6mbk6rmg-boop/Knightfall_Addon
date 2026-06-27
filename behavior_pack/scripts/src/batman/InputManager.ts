/**
 * InputManager - Handles player input and action routing
 * Detects player actions and routes them to appropriate systems
 * @module batman/InputManager
 */

import { Player } from "@minecraft/server";

/**
 * Input action enumeration
 */
export enum InputAction {
  SPRINT = "sprint",
  CROUCH = "crouch",
  JUMP = "jump",
  ATTACK = "attack",
  INTERACT = "interact",
  GADGET_1 = "gadget_1",
  GADGET_2 = "gadget_2",
  GADGET_3 = "gadget_3",
  GADGET_4 = "gadget_4",
  DETECTIVE_MODE = "detective_mode",
  GRAPNEL = "grapnel",
  GLIDE = "glide",
}

/**
 * Input action callback
 */
export type InputActionCallback = (player: Player, data?: any) => void | Promise<void>;

/**
 * InputManager - Routes player input to gameplay systems
 * Prevents conflicting actions and manages input priority
 * TODO: Implement input detection (sneak, sprint, etc.)
 * TODO: Add input buffering for quick actions
 * TODO: Implement action conflict resolution
 * TODO: Add mobile/controller support detection
 */
export interface IInputManager {
  /**
   * Register input action handler
   */
  registerAction(
    action: InputAction,
    callback: InputActionCallback
  ): () => void;

  /**
   * Unregister input action handler
   */
  unregisterAction(action: InputAction, callback: InputActionCallback): void;

  /**
   * Enable/disable input for a player
   */
  setInputEnabled(player: Player, enabled: boolean): void;

  /**
   * Check if player can perform action
   */
  canPerformAction(player: Player, action: InputAction): boolean;

  /**
   * Emit input action
   */
  emitAction(player: Player, action: InputAction, data?: any): Promise<void>;

  /**
   * Update input system per-tick
   */
  update(): Promise<void>;

  /**
   * Cleanup on shutdown
   */
  shutdown(): Promise<void>;
}

/**
 * Input action handler container
 */
interface ActionHandler {
  action: InputAction;
  callback: InputActionCallback;
}

/**
 * InputManager implementation
 * TODO: Implement this interface in Phase 2
 */
export class InputManager implements IInputManager {
  private handlers: ActionHandler[] = [];
  private disabledPlayers: Set<string> = new Set();
  private lastActionTime: Map<string, number> = new Map();
  private actionDebounce: number = 50; // ms

  registerAction(
    action: InputAction,
    callback: InputActionCallback
  ): () => void {
    throw new Error("InputManager.registerAction not implemented");
  }

  unregisterAction(
    action: InputAction,
    callback: InputActionCallback
  ): void {
    throw new Error("InputManager.unregisterAction not implemented");
  }

  setInputEnabled(player: Player, enabled: boolean): void {
    throw new Error("InputManager.setInputEnabled not implemented");
  }

  canPerformAction(player: Player, action: InputAction): boolean {
    throw new Error("InputManager.canPerformAction not implemented");
  }

  async emitAction(
    player: Player,
    action: InputAction,
    data?: any
  ): Promise<void> {
    throw new Error("InputManager.emitAction not implemented");
  }

  async update(): Promise<void> {
    throw new Error("InputManager.update not implemented");
  }

  async shutdown(): Promise<void> {
    throw new Error("InputManager.shutdown not implemented");
  }
}

export default InputManager;
