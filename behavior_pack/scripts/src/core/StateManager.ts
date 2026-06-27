/**
 * StateManager - Finite State Machine implementation for complex behaviors
 * Enables state transitions, event handling, and lifecycle management
 * @module core/StateManager
 */

export type StateHandler = () => void | Promise<void>;

export interface State {
  name: string;
  onEnter?: StateHandler;
  onUpdate?: StateHandler;
  onExit?: StateHandler;
}

/**
 * Finite state machine for entity and player behaviors
 * Supports hierarchical states and transitions with validation
 */
export class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  private previousState: State | null = null;
  private transitions: Map<string, Set<string>> = new Map();
  private isTransitioning: boolean = false;
  private stateHistory: string[] = [];
  private maxHistorySize: number = 50;

  /**
   * Register a state
   */
  public registerState(state: State): void {
    if (this.states.has(state.name)) {
      console.warn(`[StateMachine] State '${state.name}' already registered`);
      return;
    }
    this.states.set(state.name, state);
    if (!this.transitions.has(state.name)) {
      this.transitions.set(state.name, new Set());
    }
  }

  /**
   * Register allowed transition between states
   */
  public registerTransition(from: string, to: string): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Set());
    }
    this.transitions.get(from)!.add(to);
  }

  /**
   * Register bidirectional transition
   */
  public registerBiTransition(state1: string, state2: string): void {
    this.registerTransition(state1, state2);
    this.registerTransition(state2, state1);
  }

  /**
   * Transition to a new state
   * @param stateName - Target state name
   * @returns true if transition succeeded, false otherwise
   */
  public async transitionTo(stateName: string): Promise<boolean> {
    const newState = this.states.get(stateName);
    if (!newState) {
      console.warn(`[StateMachine] State '${stateName}' not registered`);
      return false;
    }

    // Check if transition is allowed
    if (this.currentState) {
      const allowedTransitions = this.transitions.get(this.currentState.name);
      if (allowedTransitions && !allowedTransitions.has(stateName)) {
        console.warn(
          `[StateMachine] Transition from '${this.currentState.name}' to '${stateName}' not allowed`
        );
        return false;
      }
    }

    if (this.isTransitioning) {
      console.warn(`[StateMachine] Transition already in progress`);
      return false;
    }

    this.isTransitioning = true;

    try {
      // Exit current state
      if (this.currentState?.onExit) {
        await this.currentState.onExit();
      }

      // Update state references
      this.previousState = this.currentState;
      this.currentState = newState;

      // Track state history
      this.stateHistory.push(stateName);
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift();
      }

      // Enter new state
      if (this.currentState.onEnter) {
        await this.currentState.onEnter();
      }

      return true;
    } catch (error) {
      console.warn(`[StateMachine] Error during state transition:`, error);
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Update current state
   */
  public async update(): Promise<void> {
    if (this.currentState?.onUpdate && !this.isTransitioning) {
      try {
        await this.currentState.onUpdate();
      } catch (error) {
        console.warn(`[StateMachine] Error updating state:`, error);
      }
    }
  }

  /**
   * Get current state name
   */
  public getCurrentStateName(): string | null {
    return this.currentState?.name || null;
  }

  /**
   * Get previous state name
   */
  public getPreviousStateName(): string | null {
    return this.previousState?.name || null;
  }

  /**
   * Check if in specific state
   */
  public isInState(stateName: string): boolean {
    return this.currentState?.name === stateName;
  }

  /**
   * Get state history
   */
  public getHistory(): string[] {
    return [...this.stateHistory];
  }

  /**
   * Get list of valid transitions from current state
   */
  public getValidTransitions(): string[] {
    if (!this.currentState) return [];
    return Array.from(
      this.transitions.get(this.currentState.name) || new Set()
    );
  }

  /**
   * Reset state machine
   */
  public reset(): void {
    this.currentState = null;
    this.previousState = null;
    this.stateHistory = [];
    this.isTransitioning = false;
  }
}

export default StateMachine;
