
# @jordan-hall/typeguard

A TypeScript library providing type-safe handling of `Result` types, pattern matching, and robust error handling utilities. Designed to enhance code reliability and readability by leveraging TypeScript's powerful type system.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Result Types](#result-types)
  - [Pattern Matching](#pattern-matching)
  - [Try/Catch Utilities](#trycatch-utilities)
  - [Utility Functions](#utility-functions)
- [API Reference](#api-reference)
- [Examples](#examples)

## Features

- **Result Types**: Simplify error handling by encapsulating success and error states.
- **Pattern Matching**: Perform expressive and type-safe pattern matching on `Result` types.
- **Try/Catch Utilities**: Advanced try/catch helpers for synchronous and asynchronous functions with type-safe error management.
- **Type Guards and Predicates**: Enhance pattern matching with custom type guards and predicate functions.
- **Flexible Patterns**: Supports literal, regex, predicate, object, array, and many patterns.

## Installation (coming soon JSR)

You can install `@jordan-hall/typeguard` via Pacakage Json:

```bash

### Using Bun
bun install @jordan-hall/typeguard

### Using npm
npm install @jordan-hall/typeguard

### Using yarn
yarn add @jordan-hall/typeguard

### Using pnpm
pnpm install @jordan-hall/typeguard
```

You can also use JSR (preferred). For import symbol view on [JSR website](https://jsr.io/@jordanhall/typeguard)

```bash
### Using Deno
deno add jsr:@jordan-hall/@jordan-hall/typeguard

### Using NPM
npx jsr add @jordanhall/@jordan-hall/typeguard
```

## Usage

### Result Types

`Result<T, E>` represents either a successful computation `Ok<T>` or a failed computation `Err<E>`.

```typescript
import { Ok, Err, Result } from '@jordan-hall/typeguard';

type User = { id: number; name: string };
type ValidationError = { field: string; message: string };

const success: Result<User, ValidationError> = Ok({ id: 1, name: "John Doe" });
const failure: Result<User, ValidationError> = Err({ field: "email", message: "Invalid email format" });
```

### Pattern Matching

Perform pattern matching on `Result` types for expressive and type-safe error handling.

```typescript
import { match, when, _, Result } from '@jordan-hall/typeguard';

function getUser(id: number): Result<User, ValidationError> {
  if (id === 0) return Err({ field: "id", message: "Invalid user ID" });
  return Ok({ id, name: "Alice" });
}

const result = getUser(1);

const message = match(result,
  { type: 'Ok', pattern: when(user => user.id > 0), handler: user => `User ID: ${user.id}, Name: ${user.name}` },
  { type: 'Err', pattern: _, handler: error => `Error in field ${error.field}: ${error.message}` }
);

console.log(message); // Output: User ID: 1, Name: Alice
```

#### Advanced Pattern Matching

Utilize type guards, predicates, and array patterns for complex matching scenarios.

```typescript
import { match, when, guard, some, every, _ } from '@jordan-hall/typeguard';

interface Order {
  id: string;
  items: Array<{ name: string; price: number }>;
}

interface OrderError {
  code: string;
  message: string;
}

const processOrder = (order: Order): Result<Order, OrderError> => {
  if (order.items.length === 0) return Err({ code: "NO_ITEMS", message: "Order must contain at least one item" });
  return Ok(order);
};

const orderResult = processOrder({ id: "order123", items: [{ name: "Book", price: 10 }] });

const message = match(orderResult,
  { type: 'Ok', pattern: some(when(item => item.price > 5)), handler: order => `Order ${order.id} has expensive items` },
  { type: 'Err', pattern: { code: "NO_ITEMS" }, handler: error => `Order Error: ${error.message}` },
  { type: 'Ok', pattern: _, handler: order => `Order ${order.id} processed successfully` }
);

console.log(message); // Output: Order order123 has expensive items
```

### Try/Catch Utilities

Simplify error handling with type-safe `tryCatch` and `tryCatchAsync` functions.

#### Synchronous `tryCatch`

```typescript
import { tryCatch } from '@jordan-hall/typeguard/tryCatch';

const [error, result] = tryCatch(() => JSON.parse('{"key": "value"}'));

if (result)) {
  console.log("Parsed value:", result);
} else {
  console.error("Parsing error:", error);
}
```

#### Asynchronous `tryCatchAsync`

```typescript
import { tryCatchAsyn } from '@jordan-hall/typeguard/tryCatch';

async function fetchData(): Promise<string> {
  // Simulate fetching data
  return "data";
}

const [error, data] = await tryCatchAsync(() => fetchData());

if (data) {
  console.log("Fetched data:", data);
} else {
  console.error("Fetching error:", error);
}
```

### Utility Functions

#### Predicates and Guards

Create custom patterns using predicates and type guards.

```typescript
import { when, guard, match, _, Result } from '@jordan-hall/typeguard';

interface Admin {
  role: 'admin';
  privileges: string[];
}

type User = { name: string; age: number } | Admin;

const isAdmin: guard<Admin> = (value): value is Admin => (value as Admin).role === 'admin';

const userResult: Result<User, string> = Ok({ name: "Bob", age: 25 });

const userMessage = match(userResult,
  { type: 'Ok', pattern: guard(isAdmin), handler: admin => `Admin with privileges: ${admin.privileges.join(", ")}` },
  { type: 'Ok', pattern: _, handler: user => `User: ${user.name}, Age: ${user.age}` },
  { type: 'Err', pattern: _, handler: error => `Error: ${error}` }
);

console.log(userMessage); // Output: User: Bob, Age: 25
```

#### Array Patterns

Match arrays with `some` or `every` patterns.

```typescript
import { some, every, when, match, _ } from '@jordan-hall/typeguard';

type Data = number[];

const data: Data = [1, 2, 3, 4];

const pattern = some(when(n => n > 3));

const matchResult = match(data,
  { type: 'Ok', pattern: pattern, handler: () => "At least one number is greater than 3" },
  { type: 'Ok', pattern: _, handler: () => "No number is greater than 3" }
);

console.log(matchResult); // Output: At least one number is greater than 3
```

## API Reference

### Types

- **`Result<T, E>`**  
  Represents a computation that can either succeed with a value of type `T` or fail with an error of type `E`.
  
- **`Ok<T, E>`**  
  Represents a successful computation containing a value of type `T`.
  
- **`Err<T, E>`**  
  Represents a failed computation containing an error of type `E`.

### Functions

#### `Ok`

Creates an `Ok` result.

```typescript
const Ok = <T, E>(value: T): Result<T, E> => ({ _tag: 'Ok', value });
```

#### `Err`

Creates an `Err` result.

```typescript
const Err = <T, E>(error: E): Result<T, E> => ({ _tag: 'Err', error });
```

#### `match`

Performs pattern matching on a `Result` type.

```typescript
function match<T, E, R>(
  result: Result<T, E>,
  ...cases: Array<MatchCase<T, E, R>>
): R;
```

#### `tryCatch`

Executes a synchronous function with type-safe error handling.

```typescript
function tryCatch<T, E = Error>(
  fn: () => T,
  acceptableErrors?: (new (...args: any[]) => AcceptableErrors<E>)[]
): [ExtractError<E>, null], [null, T];
```

#### `tryCatchAsync`

Executes an asynchronous function with type-safe error handling.

```typescript
async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  acceptableErrors?: (new (...args: any[]) => AcceptableErrors<E>)[]
): Promise<[ExtractError<E>, null], [null, T]>
```

#### `when`

Creates a predicate pattern.

```typescript
const when = <T>(predicate: (value: T) => boolean): Predicate<T> => predicate;
```

#### `guard`

Creates a type guard pattern.

```typescript
const guard = <T>(predicate: (value: unknown) => value is T): Guard<T> => predicate;
```

#### `some`

Creates a pattern that matches if any element in an array matches the given pattern.

```typescript
const some = <T>(pattern: Pattern<T>): Many<T> => ({
  type: 'some',
  pattern,
});
```

#### `every`

Creates a pattern that matches if all elements in an array match the given pattern.

```typescript
const every = <T>(pattern: Pattern<T>): Many<T> => ({
  type: 'every',
  pattern,
});
```

### Constants

- **`_`**  
  Wildcard pattern that matches any value.

  ```typescript
  const _ = Symbol('_');
  ```

## Examples

### 1. Type-Based Pattern Matching with `Result`

```typescript
import { Ok, Err, Result, match, when } from '@jordan-hall/typeguard';

/**
 * Performs division and returns a Result type.
 * @param a The dividend.
 * @param b The divisor.
 * @returns Ok with the result if successful, Err with an error message if division by zero.
 */
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
}

const result1 = divide(10, 2);
const result2 = divide(10, 0);

// Handling result1
const message1 = match(result1,
  { type: 'Ok', pattern: when(n => n > 5), handler: (value) => `Success: ${value} is greater than 5` },
  { type: 'Ok', pattern: _, handler: (value) => `Success: ${value}` },
  { type: 'Err', pattern: _, handler: (error) => `Error: ${error}` }
);
console.log(message1); // Output: Success: 5 is greater than 5

// Handling result2
const message2 = match(result2,
  { type: 'Ok', pattern: _, handler: (value) => `Success: ${value}` },
  { type: 'Err', pattern: "Division by zero", handler: (error) => `Caught error: ${error}` },
  { type: 'Err', pattern: _, handler: (error) => `Unhandled error: ${error}` }
);
console.log(message2); // Output: Caught error: Division by zero
```

```typescript
import { Ok, Err, Result, match, when } from '@jordan-hall/typeguard';

interface Payment {
  method: "credit_card" | "paypal" | "bank_transfer";
  details: {
    cardNumber?: string;
    paypalId?: string;
    bankAccount?: string;
  };
  amount: number;
}

interface PaymentError {
  code: string;
  message: string;
}

/**
 * Processes a payment and returns a Result type.
 * @param payment The payment to process.
 * @returns Ok with the payment if successful, Err with an error otherwise.
 */
function processPayment(payment: Payment): Result<Payment, PaymentError> {
  if (payment.amount <= 0) {
    return Err({ code: "INVALID_AMOUNT", message: "Amount must be greater than zero" });
  }
  // Assume processing logic here...
  return Ok(payment);
}

const payment: Payment = {
  method: "paypal",
  details: {
    paypalId: "user@paypal.com"
  },
  amount: 100
};

const paymentResult = processPayment(payment);

const paymentMessage = match(paymentResult,
  // Type-based cases
  { type: 'Ok', pattern: when(p => p.amount >= 100), handler: (p) => `Large payment of \$${p.amount}` },
  { type: 'Ok', pattern: _, handler: (p) => `Payment of \$${p.amount} processed` },
  { type: 'Err', pattern: "INVALID_AMOUNT", handler: (e) => `Error: ${e.message}` },

);

console.log(paymentMessage); // Output: Large payment of $100
```

### 5. Error Handling with `match`

```typescript
import { Ok, Err, Result, match, when } from '@jordan-hall/typeguard';

interface FileData {
  filename: string;
  content: string;
}

interface FileError {
  code: string;
  message: string;
}

/**
 * Reads a file and returns a Result type.
 * @param filename The name of the file to read.
 * @returns Ok with file data if successful, Err with a FileError otherwise.
 */
function readFile(filename: string): Result<FileData, FileError> {
  if (filename === "") {
    return Err({ code: "INVALID_FILENAME", message: "Filename cannot be empty" });
  }
  // Simulate file reading
  if (filename.endsWith(".txt")) {
    return Ok({ filename, content: "Sample text content." });
  }
  return Err({ code: "UNSUPPORTED_FORMAT", message: "File format not supported" });
}

const fileResult = readFile("data.txt");

const fileMessage = match(fileResult,
  { type: 'Ok', pattern: _, handler: (file) => `File "${file.filename}" loaded with content: ${file.content}` },
  { type: 'Err', pattern: { code: "INVALID_FILENAME" }, handler: (error) => `Error: ${error.message}` },
  { type: 'Err', pattern: { code: "UNSUPPORTED_FORMAT" }, handler: (error) => `Error: ${error.message}` }
);

console.log(fileMessage); // Output: File "data.txt" loaded with content: Sample text content.
```

### 6. Using Selector Functions in Path-Based Matching

```typescript
import { Ok, Err, Result, match, when } from '@jordan-hall/typeguard';

interface Employee {
  name: string;
  department: {
    name: string;
    level: number;
  };
  projects: Array<{ title: string; hours: number }>;
}

interface EmployeeError {
  code: string;
  message: string;
}

/**
 * Retrieves employee data and returns a Result type.
 * @param id The ID of the employee.
 * @returns Ok with employee data if found, Err with an EmployeeError otherwise.
 */
function getEmployee(id: string): Result<Employee, EmployeeError> {
  if (id === "unknown") {
    return Err({ code: "NOT_FOUND", message: "Employee not found" });
  }
  return Ok({
    name: "Carol",
    department: {
      name: "Engineering",
      level: 3
    },
    projects: [
      { title: "Project A", hours: 120 },
      { title: "Project B", hours: 80 }
    ]
  });
}

const employeeResult = getEmployee("emp456");

const employeeMessage = match(employeeResult, 
  { type: 'Ok', pattern: when(employee => employee.department.level >= 3), handler: employee => `Senior ${employee.department.name} member: ${employee.name}` },
  { type: 'Ok', pattern: { projects: some(when(project => project.hours > 100)) }, handler: employee => `${employee.name} is working extensively on projects` },
  { type: 'Ok', pattern: when(employee => employee.projects.length > 5), handler: employee => `${employee.name} is handling multiple projects` },
  { type: 'Err', pattern: _, handler: error => `Error: ${error.message}` }
);

console.log(employeeMessage); // Output: Senior Engineering member: Carol
```
