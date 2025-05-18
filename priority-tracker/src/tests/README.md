# Testing Setup for Priority Tracker

This directory contains the testing setup for the Priority Tracker application.

## Directory Structure

- `setup.ts`: Global test setup file that runs before all tests
- `components/`: Directory for component tests
- `db/`: Directory for database-related tests

## Creating Tests

To create a test file, follow these naming conventions:
- `*.test.ts` or `*.test.tsx` for TypeScript tests
- `*.spec.ts` or `*.spec.tsx` as an alternative

Example component test file location:
```
src/tests/components/TaskList.test.tsx
```

Example database test file location:
```
src/tests/db/priorityDB.test.ts
```

## Running Tests

### Running Tests for This Project Only

To run tests for the Priority Tracker project only:

1. Navigate to the priority-tracker directory:
   ```bash
   cd priority-tracker
   ```

2. Run one of the following npm scripts:
   - `npm test`: Run all tests once
   - `npm run test:watch`: Run tests in watch mode (rerun on file changes)
   - `npm run test:ui`: Run tests with the Vitest UI
   - `npm run coverage`: Run tests with coverage reporting

### Running Specific Test Files

To run a specific test file:

```bash
cd priority-tracker
npx vitest run src/tests/components/TaskForm.test.tsx
```

To run all tests in a specific directory:

```bash
cd priority-tracker
npx vitest run src/tests/db
```