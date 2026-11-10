/**
 * A universal interface for standardizing successful API responses
 * @template T - the type of the payload returned in the `data` field
 * Defaults to any
 */
export interface IApiResponse<T = any> {
  /**
   * A text message describing the status or result of a request execution.
   * @example "Roles fetched successfully"
   */
  message: string;

  /**
   *
   * The payload (data) returned to the client.
   * May be absent (optional), depending on the specifics of the endpoint.
   */
  data?: T;
}
