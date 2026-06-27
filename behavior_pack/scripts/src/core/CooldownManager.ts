/**
 * CooldownManager - Tracks ability and action cooldowns
 * Prevents ability spam and manages ability availability
 * @module core/CooldownManager
 */

interface Cooldown {
  id: string;
  duration: number;
  startTime: number;
  callback?: () => void;
}

/**
 * Manages cooldowns for abilities, items, and actions
 * Efficient tracking with periodic cleanup
 */
export class CooldownManager {
  private cooldowns: Map<string, Cooldown> = new Map();
  private updateInterval: number = 50; // 50ms update frequency
  private lastUpdate: number = Date.now();

  /**
   * Add a cooldown
   * @param id - Unique cooldown identifier
   * @param duration - Duration in milliseconds
   * @param callback - Optional callback when cooldown expires
   */
  public add(id: string, duration: number, callback?: () => void): void {
    this.cooldowns.set(id, {
      id,
      duration,
      startTime: Date.now(),
      callback,
    });
  }

  /**
   * Check if a cooldown is currently active
   */
  public isActive(id: string): boolean {
    const cooldown = this.cooldowns.get(id);
    if (!cooldown) return false;

    const elapsed = Date.now() - cooldown.startTime;
    if (elapsed >= cooldown.duration) {
      this.cooldowns.delete(id);
      return false;
    }
    return true;
  }

  /**
   * Get remaining time on a cooldown (in milliseconds)
   */
  public getRemaining(id: string): number {
    const cooldown = this.cooldowns.get(id);
    if (!cooldown) return 0;

    const elapsed = Date.now() - cooldown.startTime;
    return Math.max(0, cooldown.duration - elapsed);
  }

  /**
   * Get remaining time as percentage (0-1)
   */
  public getProgress(id: string): number {
    const cooldown = this.cooldowns.get(id);
    if (!cooldown) return 0;

    const remaining = this.getRemaining(id);
    return 1 - remaining / cooldown.duration;
  }

  /**
   * Reset a cooldown
   */
  public reset(id: string): void {
    const cooldown = this.cooldowns.get(id);
    if (cooldown) {
      cooldown.startTime = Date.now();
    }
  }

  /**
   * Remove a cooldown
   */
  public remove(id: string): void {
    this.cooldowns.delete(id);
  }

  /**
   * Update all cooldowns and trigger callbacks
   * Call this periodically from main game loop
   */
  public update(): void {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) return;

    const toRemove: string[] = [];

    for (const [id, cooldown] of this.cooldowns) {
      const elapsed = now - cooldown.startTime;
      if (elapsed >= cooldown.duration) {
        if (cooldown.callback) {
          try {
            cooldown.callback();
          } catch (error) {
            console.warn(
              `[CooldownManager] Error executing callback for '${id}':`,
              error
            );
          }
        }
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.cooldowns.delete(id);
    }

    this.lastUpdate = now;
  }

  /**
   * Get all active cooldowns
   */
  public getActive(): string[] {
    return Array.from(this.cooldowns.keys()).filter((id) =>
      this.isActive(id)
    );
  }

  /**
   * Clear all cooldowns
   */
  public clear(): void {
    this.cooldowns.clear();
  }
}

export default CooldownManager;
