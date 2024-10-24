import { expect, test, describe } from "bun:test";
import { tryCatch, tryCatchAsync } from '../src/tryCatch.ts';

// Sample interfaces for testing
interface ValidationError {
  field: string;
  message: string;
}

describe('SafeResult Try/Catch Utilities', () => {
  
  // Custom error classes for testing
  class CustomError extends Error {}
  class AsyncError extends Error {}

  // tryCatch synchronous tests
  describe('tryCatch', () => {
    test('should return [null, result] for successful execution', () => {
      const [error, result] = tryCatch(() => 42);
      expect(error).toBeNull();
      expect(result).toBe(42);
    });

    test('should return [error, null] when function throws an acceptable error', () => {
      const [error, result] = tryCatch<number, CustomError>(() => { throw new CustomError("Custom error"); }, [CustomError]);
      expect(error).toBeInstanceOf(CustomError);
      if (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error.message).toBe("Custom error");
        expect(result).toBeNull();
      }
    });

    test('should rethrow when function throws a non-acceptable error', () => {
      const fn = () => { throw new TypeError("Type error"); };
      expect(() => tryCatch<number, CustomError>(fn, [CustomError])).toThrow(TypeError);
    });

    test('should handle functions that do not throw', () => {
      const [error, result] = tryCatch(() => "Success");
      expect(error).toBeNull();
      expect(result).toBe("Success");
    });

    test('should handle null return values', () => {
      const [error, result] = tryCatch(() => null);
      expect(error).toBeNull();
      expect(result).toBeNull();
    });
  });

  // tryCatchAsync asynchronous tests
  describe('tryCatchAsync', () => {
    test('should return [null, result] for successful asynchronous execution', async () => {
      const [error, result] = await tryCatchAsync(async () => {
        return "Async Success";
      });
      expect(error).toBeNull();
      expect(result).toBe("Async Success");
    });

    test('should return [error, null] when asynchronous function throws an acceptable error', async () => {
      const [error, result] = await tryCatchAsync<string, AsyncError>(async () => {
        throw new AsyncError("Async custom error");
      }, [AsyncError]);
      expect(error).toBeInstanceOf(AsyncError);
      if (error) {
        expect(error).toBeInstanceOf(AsyncError);
        expect(error.message).toBe("Async custom error");
        expect(result).toBeNull();
      }
    });

    test('should rethrow when asynchronous function throws a non-acceptable error', async () => {
      const asyncFn = async () => { throw new ReferenceError("Reference error"); };
      await expect(tryCatchAsync(asyncFn, [AsyncError])).rejects.toThrow(ReferenceError);
    });

    test('should handle resolved promises without errors', async () => {
      const [error, result] = await tryCatchAsync(async () => {
        return { data: 123 };
      });
      expect(error).toBeNull();
      expect(result).toEqual({ data: 123 });
    });

    test('should handle asynchronous functions that throw non-Error types', async () => {
      const [error, result] = await tryCatchAsync(async () => {
        throw new Error("Async string error");
      });
      expect(error).toBeInstanceOf(Error);
      if (error) {
        expect(error.message).toBe("Async string error");
        expect(result).toBeNull();
      }
    });
  });

});