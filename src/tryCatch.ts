/**
 * @fileoverview Utility functions for executing functions with error handling.
 * Provides synchronous and asynchronous try-catch mechanisms with type-safe error handling.
 */

/**
 * Helper type to extract error types from a union.
 *
 * @template E The union type of errors.
 * @example
 * ```typescript
 * type MyError = ExtractError<Error | TypeError | string>;
 * // MyError is Error | TypeError
 * ```
 */
type ExtractError<E> = E extends Error ? E : never;

/**
 * Helper type for acceptable error types.
 *
 * @template E The base error type.
 * @example
 * ```typescript
 * type CustomErrors = AcceptableErrors<MyError>;
 * // CustomErrors includes MyError and Error
 * ```
 */
type AcceptableErrors<E> = E | Error;

/**
 * Executes a synchronous function and returns a tuple of [error, result].
 * The error is typed based on the provided error type or inferred from thrown errors.
 *
 * @template T The type of the successful result.
 * @template E The type of the error.
 * @param fn The function to execute.
 * @param acceptableErrors An optional array of constructors for acceptable error types.
 * @returns A tuple where the first element is the error (if any) and the second is the result (if successful).
 *
 * @example
 * ```typescript
 * const [error, result] = tryCatch(() => JSON.parse('{"key": "value"}'));
 * if (error) {
 *   console.error("Parsing error:", error);
 * } else {
 *   console.log("Parsed result:", result);
 * }
 * ```
 */
function tryCatch<T, E = Error>(
  fn: () => T,
  acceptableErrors?: (new (...args: any[]) => AcceptableErrors<E>)[]
): [ExtractError<E>, null] |  [null, T] {
  try {
    const result = fn();
    return [null, result];
  } catch (error) {
    if (acceptableErrors?.length) {
      const isAcceptableError = acceptableErrors.some(
        errorType => error instanceof errorType
      );
      
      if (!isAcceptableError) {
        throw error;
      }
    }
    
    return [error as ExtractError<E>, null];
  }
}

/**
 * Executes an asynchronous function and returns a tuple of [error, result].
 * The error is typed based on the provided error type or inferred from thrown errors.
 *
 * @template T The type of the successful result.
 * @template E The type of the error.
 * @param fn The asynchronous function to execute.
 * @param acceptableErrors An optional array of constructors for acceptable error types.
 * @returns A promise that resolves to a tuple where the first element is the error (if any) and the second is the result (if successful).
 *
 * @example
 * ```typescript
 * const [error, result] = await tryCatchAsync(async () => {
 *   const data = await fetchData();
 *   return processData(data);
 * });
 * if (error) {
 *   console.error("Processing error:", error);
 * } else {
 *   console.log("Processed data:", result);
 * }
 * ```
 */
async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  acceptableErrors?: (new (...args: any[]) => AcceptableErrors<E>)[]
): Promise<[ExtractError<E>, null] |  [null, T]> {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    if (acceptableErrors?.length) {
      const isAcceptableError = acceptableErrors.some(
        errorType => error instanceof errorType
      );
      
      if (!isAcceptableError) {
        throw error;
      }
    }
    
    return [error as ExtractError<E>, null];
  }
}

export {
  tryCatch,
  tryCatchAsync,
  type ExtractError,
};
