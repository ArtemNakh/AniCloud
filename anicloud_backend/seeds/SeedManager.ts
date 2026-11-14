/**
 * Universal interface for database connection and lifecycle management.
 * Allows decoupling the SeedManager from any specific ORM (TypeORM, Prisma, Sequelize, etc.).
 */
export interface IDbAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): any;
}

/**
 * Signature for a seed function.
 * Any seeder must accept a universal database client instance and arbitrary arguments.
 *
 * @param dbClient - The underlying database client/connection instance (e.g., DataSource, PrismaClient).
 * @param args - Additional parameters required for the specific seeder (e.g., limits, configurations, etc.).
 */
type SeedFunction = (dbClient: any, ...args: any[]) => Promise<any> | void;

/**
 * Interface describing an individual seed task within the execution queue.
 */
interface SeedTask {
  /** Unique or descriptive name of the task (used in logs and queue management) */
  name: string;

  /** Seed function to be executed */
  fn: SeedFunction;

  /** Array of arguments to be passed into the seed function */
  args: any[];
}

/**
 * Task Runner / Manager for sequential execution of database seeds.
 * Independent of any specific ORM through the use of the IDbAdapter interface.
 * Allows dynamically building a task queue, managing it, and ensures
 * safe database connection/disconnection with error handling.
 */
export class SeedManager {
  /** Database adapter instance handling connection lifecycle */
  private dbAdapter: IDbAdapter;

  /** Queue of scheduled seed tasks */
  private seedQueue: SeedTask[] = [];

  /**
   * Creates an instance of the SeedManager.
   *
   * @param dbAdapter - Database adapter implementing the IDbAdapter interface.
   */
  constructor(dbAdapter: IDbAdapter) {
    this.dbAdapter = dbAdapter;
  }

  /**
   * Adds a new seed to the overall execution queue.
   * Supports method chaining.
   *
   * @param name - Unique or descriptive name of the seed for logging.
   * @param fn - Seed function matching the `SeedFunction` type.
   * @param args - Additional arguments that will be passed to the `fn` function upon execution.
   * @returns Returns the current `SeedManager` instance for method chaining.
   *
   * @example
   * ```ts
   * seeder.addSeed('Users', seedUsers, 100).addSeed('Roles', seedRoles);
   * ```
   */
  public addSeed(name: string, fn: SeedFunction, ...args: any[]): this {
    this.seedQueue.push({ name, fn, args });
    return this;
  }

  /**
   * Returns information about all current tasks in the execution queue.
   *
   * @returns An array of objects containing the seed name, argument count, and arguments.
   */
  public getSeeds(): Array<{ name: string; argsCount: number; args: any[] }> {
    return this.seedQueue.map((task) => ({
      name: task.name,
      argsCount: task.args.length,
      args: task.args,
    }));
  }

  /**
   * Removes a specific seed from the queue by its name.
   *
   * @param name - The name of the seed to remove from the queue.
   * @returns `true` if the seed was successfully found and removed, `false` otherwise.
   */
  public removeSeed(name: string): boolean {
    const initialLength = this.seedQueue.length;
    this.seedQueue = this.seedQueue.filter((task) => task.name !== name);

    const isRemoved = this.seedQueue.length < initialLength;
    if (isRemoved) {
      console.log(`Seed "${name}" was removed from the queue.`);
    } else {
      console.log(`Seed "${name}" not found in the queue.`);
    }

    return isRemoved;
  }

  /**
   * Main execution method. Initializes the database connection via the adapter,
   * sequentially runs all registered seeds passing the raw client, and guarantees connection closure in the `finally` block.
   *
   * In case of an error, logs it to the console and exits the process with code `1`.
   *
   * @returns A promise that resolves after all seeds have executed or an error occurs.
   */
  public async execute(): Promise<void> {
    try {
      await this.dbAdapter.connect();
      console.log('Database connected for seeding');

      const client = this.dbAdapter.getClient();

      // Sequential iteration and execution of registered seeds
      for (const task of this.seedQueue) {
        await this.runSeed(task, client);
      }

      console.log('All seeds successfully executed');
    } catch (err) {
      console.error('Seeding process failed:', err);
    } finally {
      await this.dbAdapter.disconnect();
      console.log('Database connection closed');
    }
  }

  /**
   * Helper (private) method to execute an individual task with exception handling.
   *
   * @param task - The `SeedTask` object containing the name, function, and arguments.
   * @param client - The underlying database client/connection.
   * @throws Throws an error upwards if execution of a specific seed fails.
   */
  private async runSeed(task: SeedTask, client: any): Promise<void> {
    try {
      console.log(`Running ${task.name}...`);
      await task.fn(client, ...task.args);
      console.log(`${task.name} completed successfully.`);
    } catch (err: any) {
      console.error(`Error in ${task.name}:`, err.message || err);
      throw err;
    }
  }
}
