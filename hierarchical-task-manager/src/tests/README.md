# Testing Documentation

This directory contains tests for the Hierarchical Task Manager application. The testing setup uses Vitest as the test runner and happy-dom for simulating a DOM environment.

## Test Structure

The tests are organized into the following directories:

- `components/`: Tests for React components
- `db/`: Tests for database operations
- `utils/`: Tests for utility functions

## Running Tests

### Running Tests for This Project Only

To run tests for the Hierarchical Task Manager project only:

1. Navigate to the hierarchical-task-manager directory:
   ```bash
   cd hierarchical-task-manager
   ```

2. Run one of the following npm scripts:
   - `npm test`: Run all tests once
   - `npm run test:watch`: Run tests in watch mode (tests will re-run when files change)
   - `npm run test:ui`: Run tests with the Vitest UI
   - `npm run coverage`: Run tests and generate coverage reports

### Running Specific Test Files

To run a specific test file or directory:

```bash
cd hierarchical-task-manager
npx vitest run src/tests/components/SidebarNav.test.tsx
```

To run all tests in a specific directory:

```bash
cd hierarchical-task-manager
npx vitest run src/tests/utils
```

## Test Files

Test files should follow these naming conventions:

- Component tests: `ComponentName.test.tsx`
- Database tests: `DatabaseName.test.ts`
- Utility tests: `UtilityName.test.ts`

## Writing Tests

When writing tests, follow these guidelines:

1. Use descriptive test names that explain what is being tested
2. Group related tests using `describe` blocks
3. Use `beforeEach` and `afterEach` for setup and cleanup
4. Mock external dependencies when necessary
5. Test both success and error cases

## Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});