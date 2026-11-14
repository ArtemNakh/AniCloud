import { DataSource } from 'typeorm';
import { IDbAdapter } from './IDBAdapter';

/**
 * TypeORM implementation of the database adapter interface.
 * Wraps the TypeORM {@link DataSource} to provide unified lifecycle management
 * and client access across different database implementations.
 */
export class TypeOrmAdapter implements IDbAdapter<DataSource> {
  /**
   * Creates an instance of TypeOrmAdapter.
   *
   * @param dataSource - Configured TypeORM DataSource instance responsible for database operations.
   */
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Initializes the TypeORM DataSource connection and opens the connection pool.
   *
   * @returns A promise that resolves once the connection is established.
   * @throws {Error} If DataSource initialization fails (e.g., invalid configuration or unreachable database).
   */
  public async connect(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  /**
   * Closes the TypeORM DataSource connection and releases all underlying pool resources.
   *
   * @returns A promise that resolves once the connection is gracefully closed.
   * @throws {Error} If an error occurs while destroying the DataSource connection.
   */
  public async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  /**
   * Checks whether the underlying TypeORM DataSource is currently initialized and connected.
   *
   * @returns `true` if connected, otherwise `false`.
   */
  public isConnected(): boolean {
    return this.dataSource.isInitialized;
  }
  /**
   * Retrieves the underlying TypeORM DataSource instance.
   *
   * @returns The active {@link DataSource} client.
   */
  public getClient(): DataSource {
    return this.dataSource;
  }
}
