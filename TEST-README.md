# Testing Guide for Projects

This repository contains two separate projects:
- `hierarchical-task-manager`
- `priority-tracker`

Each project has its own test suite that can be run independently.

## Running Tests for a Specific Project

### Option 1: Using the Convenience Script

A convenience script `run-tests.sh` is provided at the root level to easily run tests for either project:

```bash
# Run all tests for hierarchical-task-manager
./run-tests.sh hierarchical-task-manager

# Run all tests for priority-tracker
./run-tests.sh priority-tracker
```

The script supports various options:

```bash
# Run tests in watch mode
./run-tests.sh hierarchical-task-manager --watch

# Run tests with UI
./run-tests.sh priority-tracker --ui

# Run tests with coverage
./run-tests.sh hierarchical-task-manager --coverage

# Run a specific test file
./run-tests.sh priority-tracker --file src/tests/components/TaskForm.test.tsx

# Run all tests in a specific directory
./run-tests.sh hierarchical-task-manager --dir src/tests/utils
```

For more information, run:

```bash
./run-tests.sh --help
```

### Option 2: Running Tests Directly in Each Project

You can also navigate to each project directory and run the tests directly:

#### Hierarchical Task Manager

```bash
cd hierarchical-task-manager
npm test                  # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Run tests with UI
npm run coverage          # Run tests with coverage
npx vitest run <file>     # Run a specific test file
```

#### Priority Tracker

```bash
cd priority-tracker
npm test                  # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Run tests with UI
npm run coverage          # Run tests with coverage
npx vitest run <file>     # Run a specific test file
```

## Test Documentation

For more detailed information about the tests in each project, refer to:

- [Hierarchical Task Manager Tests](hierarchical-task-manager/src/tests/README.md)
- [Priority Tracker Tests](priority-tracker/src/tests/README.md)