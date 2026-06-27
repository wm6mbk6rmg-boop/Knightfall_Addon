/**
 * ServiceRegistry - Manages shared system initialization and lifecycle
 * Provides dependency injection and service management
 * @module core/ServiceRegistry
 */

export interface Service {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Singleton service registry for Knightfall addon
 * Manages service registration, initialization, and lifecycle
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, Service> = new Map();
  private initialized: Set<string> = new Set();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service
   */
  public register(name: string, service: Service): void {
    if (this.services.has(name)) {
      console.warn(`[ServiceRegistry] Service '${name}' already registered`);
      return;
    }
    this.services.set(name, service);
  }

  /**
   * Get a registered service
   */
  public get<T extends Service>(name: string): T | null {
    return (this.services.get(name) as T) || null;
  }

  /**
   * Initialize a single service
   */
  public async initialize(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }
    if (this.initialized.has(name)) {
      console.warn(`[ServiceRegistry] Service '${name}' already initialized`);
      return;
    }
    await service.initialize();
    this.initialized.add(name);
  }

  /**
   * Initialize all registered services
   */
  public async initializeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [name, service] of this.services) {
      if (!this.initialized.has(name)) {
        promises.push(
          service.initialize().then(() => this.initialized.add(name))
        );
      }
    }
    await Promise.all(promises);
  }

  /**
   * Shutdown a service
   */
  public async shutdown(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }
    await service.shutdown();
    this.initialized.delete(name);
  }

  /**
   * Shutdown all services in reverse order
   */
  public async shutdownAll(): Promise<void> {
    const names = Array.from(this.services.keys()).reverse();
    for (const name of names) {
      if (this.initialized.has(name)) {
        await this.shutdown(name);
      }
    }
  }

  /**
   * Check if a service is initialized
   */
  public isInitialized(name: string): boolean {
    return this.initialized.has(name);
  }
}

export default ServiceRegistry;
