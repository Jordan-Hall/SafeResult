/**
 * @fileoverview A comprehensive TypeScript library for handling Result types and pattern matching.
 * This module provides a type-safe way to handle success and error cases, along with
 * powerful pattern matching capabilities.
 * 
 * @example
 * ```typescript
 * // Basic Result usage
 * const divide = (a: number, b: number): Result<number, string> => {
 *   if (b === 0) return Err("Division by zero");
 *   return Ok(a / b);
 * };
 * 
 * // Pattern matching usage
 * const result = divide(10, 2);
 * const message = match(result,
 *   { type: 'Ok', pattern: 5, handler: (value) => `Got exactly 5` },
 *   { type: 'Ok', pattern: when(n => n > 5), handler: (value) => `Got ${value}, which is > 5` },
 *   { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
 *   { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
 * );
 * ```
 */


/**
 * Represents a successful computation containing a value.
 * Use the {@link Ok} constructor to create instances.
 * 
 * @template T The type of the success value
 * @template E The type of the error value
 * 
 * @example
 * ```typescript
 * const successfulResult: Result<number, never> = Ok(42);
 * ```
 */
interface Ok<T, E> {
  readonly _tag: 'Ok';
  readonly value: T;
}

/**
 * Represents a failed computation containing an error.
 * Use the {@link Err} constructor to create instances.
 * 
 * @template T The type of the success value
 * @template E The type of the error value
 * 
 * @example
 * ```typescript
 * const failedResult: Result<never, string> = Err("Something went wrong");
 * ```
 */
interface Err<T, E> {
  readonly _tag: 'Err';
  readonly error: E;
}

/**
 * Represents all possible patterns that can be matched against a value.
 * This type forms the foundation of the pattern matching system.
 * 
 * @template T The type of value being matched
 * 
 * @example
 * ```typescript
 * // Literal pattern
 * const pattern1: Pattern<number> = 42;
 * 
 * // RegExp pattern
 * const pattern2: Pattern<string> = /^hello/;
 * 
 * // Predicate pattern
 * const pattern3: Pattern<number> = when(n => n > 0);
 * 
 * // Object pattern
 * const pattern4: Pattern<User> = { age: when(n => n >= 18) };
 * ```
 */
type Pattern<T> =
  | T
  | Many<T>
  | RegExp
  | Guard<T>
  | Predicate<T>
  | ObjectPattern<T>
  | ArrayPattern<T>
  | typeof _

/**
 * A type guard function that checks if a value is of type T.
 * Used for type-safe pattern matching with custom types.
 * 
 * @template T The type being guarded
 * 
 * @example
 * ```typescript
 * const isString: Guard<string> = 
 *   (value: unknown): value is string => typeof value === 'string';
 * 
 * match(result,
 *   { type: 'Ok', pattern: guard(isString), handler: str => `Got string: ${str}` },
 *   { type: 'Ok', pattern: _, handler: value => `Got something else` }
 * );
 * ```
 */
type Guard<T> = (value: unknown) => value is T;

/**
 * A predicate function that tests a condition on a value.
 * Used for creating custom matching patterns.
 * 
 * @template T The type of value being tested
 * 
 * @example
 * ```typescript
 * const isEven: Predicate<number> = (n) => n % 2 === 0;
 * 
 * match(result,
 *   { type: 'Ok', pattern: when(isEven), handler: n => `${n} is even` },
 *   { type: 'Ok', pattern: _, handler: n => `${n} is odd` }
 * );
 * ```
 */
type Predicate<T> = (value: T) => boolean;

/**
 * A pattern type for matching object shapes.
 * Allows matching on partial object structures with nested patterns.
 * 
 * @template T The type of object being matched
 * 
 * @example
 * ```typescript
 * interface User { name: string; age: number; }
 * 
 * const pattern: ObjectPattern<User> = {
 *   name: /^A/,
 *   age: when(n => n >= 18)
 * };
 * ```
 */
type ObjectPattern<T> = T extends object ? { [K in keyof T]?: Pattern<T[K]> } : never;

/**
 * A pattern type for matching arrays.
 * Allows matching array elements against patterns.
 * 
 * @template T The type of array being matched
 * 
 * @example
 * ```typescript
 * const pattern: ArrayPattern<number[]> = [1, when(n => n > 0), 3];
 * matches([1, 2, 3], pattern); // true
 * ```
 */
type ArrayPattern<T> = T extends Array<infer U> ? Array<Pattern<U>> : never;


/**
 * Infers the item type from an array type.
 *
 * This utility type takes an array type `T` and extracts the type of its elements.
 * If `T` is not an array type, it will return `never`.
 *
 * @template T - The type to infer the item type from, which should be an array type.
 * @returns The inferred item type of the array, or `never` if `T` is not an array.
 *
 * @example
 * ```typescript
 * type NumberArray = number[];
 * type ItemType = InferArrayItemType<NumberArray>; // ItemType is number
 *
 * type StringArray = string[];
 * type StringItemType = InferArrayItemType<StringArray>; // StringItemType is string
 *
 * type NonArrayType = InferArrayItemType<number>; // NonArrayType is never
 * ```
 */
type InferArrayItemType<T> = T extends (infer U)[] ? U : never;

/**
 * A pattern type for matching multiple elements in an array using quantifiers.
 * Supports 'some' and 'every' array matching strategies.
 * 
 * @template T The type of elements being matched
 * 
 * @example
 * ```typescript
 * const hasEven: Many<number> = some(when(n => n % 2 === 0));
 * const allPositive: Many<number> = every(when(n => n > 0));
 * 
 * matches([1, 2, 3], hasEven); // true
 * matches([1, 2, 3], allPositive); // true
 * ```
 */
interface Many<T> {
  type: 'some' | 'every';
  pattern: Pattern<InferArrayItemType<T>>;
}

/**
 * Pattern marker for wildcard matches.
 * Matches any value without conditions.
 */
const _ = Symbol('_');


/**
 * Represents the result of an operation, which can either be a success (Ok) or a failure (Err).
 * 
 * @template T The type of the success value.
 * @template E The type of the error value.
 */
type Result<T, E> = { _tag: 'Ok'; value: T } | { _tag: 'Err'; error: E };

/**
 * Creates a successful Result containing the provided value.
 *
 * @template T The type of the success value.
 * @param value The success value.
 * @returns A Result in the Ok state, with error type as `null`.
 *
 * @example
 * ```typescript
 * const success = Ok<number>(42); // Result<number, null>
 * const user = Ok<User>({ id: 1, name: "John" }); // Result<User, null>
 * ```
 */
function Ok<T>(value: T): Result<T, any>;

/**
 * Creates a successful Result containing the provided value with a custom error type.
 *
 * @template T The type of the success value.
 * @template E The type of the error value, defaults to `null`.
 * @param value The success value.
 * @returns A Result in the Ok state.
 *
 * @example
 * ```typescript
 * const success = Ok<number, string>(42); // Result<number, string>
 * ```
 */
function Ok<T, E = null>(value: T): Result<T, E> {
  return { _tag: 'Ok', value };
}

/**
 * Creates a failed Result containing the provided error.
 *
 * @template E The type of the error value.
 * @param error The error value.
 * @returns A Result in the Err state, with success type as `null`.
 *
 * @example
 * ```typescript
 * const error = Err<string>("Invalid number"); // Result<null, string>
 * const validationError = Err<ValidationError>(
 *   new ValidationError("email", "Invalid email format")
 * );
 * ```
 */
function Err<E>(error: E): Result<any, E>;

/**
 * Creates a failed Result containing the provided error with a custom success type.
 *
 * @template T The type of the success value, defaults to `null`.
 * @template E The type of the error value.
 * @param error The error value.
 * @returns A Result in the Err state.
 *
 * @example
 * ```typescript
 * const error = Err<number, string>("Invalid number"); // Result<number, string>
 * ```
 */
function Err<T, E>(error: E): Result<T, E> {
  return { _tag: 'Err', error };
}


/**
 * Creates a pattern that matches if any element in an array matches the given pattern.
 * 
 * @template T The type of elements to match
 * @param pattern The pattern to match against array elements
 * @returns A Many pattern with 'some' type
 * 
 * @example
 * ```typescript
 * const hasEvenNumber = some(when((n: number) => n % 2 === 0));
 * matches([1, 2, 3], hasEvenNumber); // true
 * matches([1, 3, 5], hasEvenNumber); // false
 * ```
 */
const some = <T>(pattern: Pattern<InferArrayItemType<T>>): Many<T> => ({
  type: 'some',
  pattern,
});

/**
 * Creates a pattern that matches if all elements in an array match the given pattern.
 * 
 * @template T The type of elements to match
 * @param pattern The pattern to match against array elements
 * @returns A Many pattern with 'every' type
 * 
 * @example
 * ```typescript
 * const allPositive = every(when((n: number) => n > 0));
 * matches([1, 2, 3], allPositive); // true
 * matches([1, -2, 3], allPositive); // false
 * ```
 */
const every = <T>(pattern: Pattern<InferArrayItemType<T>>): Many<T> => ({
  type: 'every',
  pattern,
});

/**
 * Utility function to create a predicate pattern.
 * 
 * @template T The type of value being tested
 * @param predicate The predicate function
 * @returns A Predicate pattern
 */
const when = <T>(predicate: (value: T) => boolean): Predicate<T> => predicate;

/**
 * Utility function to create a guard pattern.
 * 
 * @template T The type being guarded
 * @param predicate The guard function
 * @returns A Guard pattern
 */
const guard = <T>(predicate: (value: unknown) => value is T): Guard<T> => predicate;

/**
 * Try/catch helper that executes a synchronous function and returns a Result.
 * 
 * @template T The type of the successful result
 * @template E The type of the error
 * @param fn The function to execute
 * @returns A Result representing success or error
 */
const tryExec = <T, E = Error>(fn: () => T): Result<T, E> => {
  try {
    return Ok(fn()) as Result<T, E>;
  } catch (error) {
    return Err(error as E) as Result<T, E>;
  }
};

/**
 * Try/catch helper that executes an asynchronous function and returns a Result.
 * 
 * @template T The type of the successful result
 * @template E The type of the error
 * @param fn The asynchronous function to execute
 * @returns A Promise resolving to a Result representing success or error
 */
const tryExecAsync = async <T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> => {
  try {
    return Ok(await fn()) as Result<T, E>;
  } catch (error) {
    return Err(error as E) as Result<T, E>;
  }
};

/**
 * Defines the structure of a match case for pattern matching.
 * It discriminates between 'Ok' and 'Err' cases.
 * 
 * @template T The type of the success value
 * @template E The type of the error value
 * @template R The return type of the handler
 */
type MatchCase<T, E, R> =
  | { type: 'Ok'; pattern: Pattern<T>; handler: (value: T) => R }
  | { type: 'Err'; pattern: Pattern<E>; handler: (value: E) => R };

/**
 * The main pattern matching function.
 * It takes a Result and a series of MatchCases to determine the outcome.
 * 
 * @template T The type of the success value
 * @template E The type of the error value
 * @template R The return type
 * @param result The Result to match against
 * @param cases The MatchCases defining patterns and corresponding handlers
 * @returns The result of the matched handler
 * @throws Error if no pattern matches
 * 
 * @example
 * ```typescript
 * const message = match(result,
 *   { type: 'Ok', pattern: 5, handler: (value) => `Got exactly 5` },
 *   { type: 'Ok', pattern: when(n => n > 5), handler: (value) => `Got ${value}, which is > 5` },
 *   { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
 *   { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
 * );
 * ```
 */
function match<T, E, R>(
  result: Result<T, E>,
  ...cases: Array<MatchCase<T, E, R>>
): R {
  for (const caseItem of cases) {
    if (result._tag === 'Ok' && caseItem.type === 'Ok') {
      if (matches(result.value, caseItem.pattern)) {
        return caseItem.handler(result.value);
      }
    } else if (result._tag === 'Err' && caseItem.type === 'Err') {
      if (matches(result.error, caseItem.pattern)) {
        return caseItem.handler(result.error);
      }
    }
  }
  throw new Error('Pattern matching not exhaustive');
}

function matches<T>(value: T, pattern: Pattern<T>): boolean {
  if (pattern === _) return true;
  if (isGuardOrPredicate(pattern)) {
    return pattern(value);
  }

  if (isRegExp(pattern) && typeof value === 'string') {
    return pattern.test(value);
  }

  if (isArrayPattern(pattern) && Array.isArray(value)) {
    return (
      pattern.length === value.length &&
      pattern.every((p, i) => matches(value[i], p))
    );
  }

  if (isObjectPattern(pattern) && typeof value === 'object' && value !== null) {
    return Object.entries(pattern).every(([key, p]) =>
      matches((value as any)[key], p as Pattern<any>)
    );
  }

  if (isManyPattern(pattern) && Array.isArray(value)) {
    if (pattern.type === 'some') {
      return value.some(v => matches(v, pattern.pattern));
    } else {
      return value.every(v => matches(v, pattern.pattern));
    }
  }

  return value === pattern;
}

function isGuardOrPredicate<T>(pattern: Pattern<T>): pattern is Guard<T> | Predicate<T> {
  return typeof pattern === 'function';
}

function isRegExp(pattern: unknown): pattern is RegExp {
  return pattern instanceof RegExp;
}

function isArrayPattern<T>(pattern: Pattern<T>): pattern is ArrayPattern<T> {
  return Array.isArray(pattern);
}

function isObjectPattern<T>(pattern: Pattern<T>): pattern is ObjectPattern<T> {
  return typeof pattern === 'object' && pattern !== null && !Array.isArray(pattern) && !('type' in pattern);
}

function isManyPattern<T>(pattern: Pattern<T>): pattern is Many<T> {
  return (
    typeof pattern === 'object' &&
    pattern !== null &&
    'type' in pattern &&
    (pattern.type === 'some' || pattern.type === 'every')
  );
}

export {
  Ok,
  Err,
  match,
  when,
  guard,
  some,
  every,
  _,
  tryExec,
  tryExecAsync,
};
export type { Result, Pattern, Many };
