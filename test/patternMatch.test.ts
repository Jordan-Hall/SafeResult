import { Ok, Err, match, when, some, every, _, type Result, type Pattern, type Many } from '../src/patternMatch.ts';
import { expect, test, describe } from "bun:test";

interface User {
  name: string;
  age: number;
}

interface ValidationError {
  field: string;
  message: string;
}

interface Product {
  id: string;
  category: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  status: "pending" | "shipped" | "delivered" | "canceled";
  total: number;
  customer: {
    name: string;
    loyaltyPoints: number;
  };
}

describe('SafeResult Pattern Matching', () => {
  
  // Ok and Err constructors
  test('Ok constructor should create a successful Result', () => {
    const result: Result<number, null> = Ok(42);
    expect(result._tag).toBe('Ok');
    expect((result as Ok<number, null>).value).toBe(42);
  });

  test('Err constructor should create a failed Result', () => {
    const error: Result<null, string> = Err("Something went wrong");
    expect(error._tag).toBe('Err');
    expect((error as Err<null, string>).error).toBe("Something went wrong");
  });

  // match function with literal pattern
  test('match with literal pattern should handle exact match', () => {
    const result = Ok(5);
    const message = match(result,
      { type: 'Ok', pattern: 5, handler: (value) => `Got exactly 5` },
      { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
    );
    expect(message).toBe('Got exactly 5');
  });

  // match function with predicate pattern
  test('match with predicate pattern should handle predicate match', () => {
    const result = Ok(10);
    const message = match(result,
      { type: 'Ok', pattern: when(n => n > 5), handler: (value) => `Got ${value}, which is > 5` },
      { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('Got 10, which is > 5');
  });

  // match function with wildcard pattern
  test('match with wildcard pattern should handle any value', () => {
    const result = Ok(3);
    const message = match(result,
      { type: 'Ok', pattern: when(n => n > 5), handler: (value) => `Got ${value}, which is > 5` },
      { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('Got 3');
  });

  test('match with Err type should handle error cases', () => {
    const result = Err("Invalid input");
    const message = match(result,
      { type: 'Ok', pattern: _, handler: (value) => `Got ${value}` },
      { type: 'Err', pattern: "Invalid input", handler: (error) => `Caught error: ${error}` },
      { type: 'Err', pattern: _, handler: (error) => `Unhandled error: ${error}` }
    );
    expect(message).toBe('Caught error: Invalid input');
  });

  test('match with RegExp pattern should handle regex matching', () => {
    const result = Ok("hello world");
    const message = match(result,
      { type: 'Ok', pattern: /^hello/, handler: (value) => `Greeting detected` },
      { type: 'Ok', pattern: _, handler: (value) => `Received: ${value}` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('Greeting detected');
  });

  test('match with object pattern should handle partial object matching', () => {
    const user: User = { name: "Alice", age: 30 };
    const result = Ok(user);
    const message = match(result,
      { type: 'Ok', pattern: { age: when(age => age >= 18) }, handler: (u) => `Adult user: ${u.name}` },
      { type: 'Ok', pattern: _, handler: (u) => `User: ${u.name}` },
    );
    expect(message).toBe('Adult user: Alice');
  });

  // match function with array pattern
  test('match with array pattern should handle exact array matching', () => {
    const numbers = [1, 2, 3];
    const pattern: Pattern<number[]> = [1, 2, 3];
    const result = Ok(numbers);
    const message = match(result,
      { type: 'Ok', pattern: pattern, handler: () => `Exact match` },
      { type: 'Ok', pattern: _, handler: () => `No match` },
    );
    expect(message).toBe('Exact match');
  });

  test('match with array pattern and predicates', () => {
    const numbers = [1, 2, 3];
    const pattern: Pattern<number[]> = [1, when(n => n > 1), 3];
    const result = Ok(numbers);
    const message = match(result,
      { type: 'Ok', pattern: pattern, handler: () => `Array matches pattern` },
      { type: 'Ok', pattern: _, handler: () => `Array does not match` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('Array matches pattern');
  });

  // match function with 'some' pattern
  test('match with some pattern should match if any element satisfies the condition', () => {
    const numbers = [1, 2, 3];
    const pattern = some<number[]>(when(n => n > 2));
    const result = Ok(numbers);
    const message = match(result,
      { type: 'Ok', pattern, handler: () => `At least one number is greater than 2` },
      { type: 'Ok', pattern: _, handler: () => `No number is greater than 2` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('At least one number is greater than 2');
  });

  // match function with 'every' pattern
  test('match with every pattern should match if all elements satisfy the condition', () => {
    const numbers = [1, 2, 3];
    const pattern =  every<number[]>(when(n => n > 0));
    const result = Ok(numbers);
    const message = match(result,
      { type: 'Ok', pattern: pattern, handler: () => `All numbers are positive` },
      { type: 'Ok', pattern: _, handler: () => `Not all numbers are positive` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('All numbers are positive');
  });

  // match function with multiple patterns
  test('match with multiple patterns should return the first matching handler', () => {
    const order: Order = {
      id: "order123",
      status: "shipped",
      total: 250,
      customer: {
        name: "Bob",
        loyaltyPoints: 150
      }
    };
    const result = Ok(order);
    const message = match(result,
      { type: 'Ok', pattern: when(o => o.total > 200), handler: () => `High value order` },
      { type: 'Ok', pattern: { status: "shipped" }, handler: () => `Order has been shipped` },
      { type: 'Ok', pattern: _, handler: () => `Order processed` },
      { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
    );
    expect(message).toBe('High value order');
  });

  // match function with non-matching patterns
  test('match should throw error if no pattern matches', () => {
    const result: Result<number, string> = Ok(10);
    expect(() => {
      match(result,
        { type: 'Ok', pattern: 5, handler: () => `Got 5` },
        { type: 'Err', pattern: _, handler: () => `Error occurred` }
      );
    }).toThrow('Pattern matching not exhaustive');
  });

});
