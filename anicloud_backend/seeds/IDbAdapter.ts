/*
 * Unique interface for adaptive connection management with database
 */
export interface IDbAdapter<TClient = unknown> {
  /**
   * Establishes an asynchronous connection to the database.
   * Initializes the underlying client, opens the connection pool,
   * or sets up adaptive reconnection strategies.
   *
   * @throws {Error} If the connection fails due to network issues,
   *                 invalid credentials, or database unavailability.
   */
  connect(): Promise<void>;

  /**
   * Gracefully closes the active database connection.
   * Ensures all system resources are released, pending transactions are settled,
   * and the connection pool is properly drained.
   *
   * @throws {Error} If an error occurs while closing the connection.
   */
  disconnect(): Promise<void>;

  /**
   * Checks whether the database connection is currently active and initialized.
   *
   * @returns `true` if connected, otherwise `false`.
   */
  isConnected(): boolean;

  /**
   * Return client ORM (datasource,prismaclient,sequelize other)
   */
  getClient(): TClient;
}
