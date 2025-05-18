#!/bin/bash

# Script to run tests for either project from the root directory

# Display usage information
function show_usage {
  echo "Usage: ./run-tests.sh [options] <project>"
  echo ""
  echo "Run tests for a specific project"
  echo ""
  echo "Arguments:"
  echo "  project                 Project to test (hierarchical-task-manager or priority-tracker)"
  echo ""
  echo "Options:"
  echo "  -h, --help              Show this help message"
  echo "  -w, --watch             Run tests in watch mode"
  echo "  -u, --ui                Run tests with UI"
  echo "  -c, --coverage          Run tests with coverage"
  echo "  -f, --file <file>       Run a specific test file"
  echo "  -d, --dir <directory>   Run all tests in a specific directory"
  echo ""
  echo "Examples:"
  echo "  ./run-tests.sh hierarchical-task-manager"
  echo "  ./run-tests.sh priority-tracker --watch"
  echo "  ./run-tests.sh hierarchical-task-manager --file src/tests/utils/priorityUtils.test.ts"
  echo "  ./run-tests.sh priority-tracker --dir src/tests/components"
}

# Default values
PROJECT=""
MODE="run"
TEST_TARGET=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_usage
      exit 0
      ;;
    -w|--watch)
      MODE="watch"
      shift
      ;;
    -u|--ui)
      MODE="ui"
      shift
      ;;
    -c|--coverage)
      MODE="coverage"
      shift
      ;;
    -f|--file)
      if [[ -z "$2" || "$2" == -* ]]; then
        echo "Error: --file requires a file path"
        exit 1
      fi
      TEST_TARGET="$2"
      MODE="file"
      shift 2
      ;;
    -d|--dir)
      if [[ -z "$2" || "$2" == -* ]]; then
        echo "Error: --dir requires a directory path"
        exit 1
      fi
      TEST_TARGET="$2"
      MODE="dir"
      shift 2
      ;;
    hierarchical-task-manager|priority-tracker)
      PROJECT="$1"
      shift
      ;;
    *)
      echo "Error: Unknown option $1"
      show_usage
      exit 1
      ;;
  esac
done

# Validate project argument
if [[ -z "$PROJECT" ]]; then
  echo "Error: You must specify a project (hierarchical-task-manager or priority-tracker)"
  show_usage
  exit 1
fi

# Check if project directory exists
if [[ ! -d "$PROJECT" ]]; then
  echo "Error: Project directory '$PROJECT' not found"
  exit 1
fi

# Change to project directory
cd "$PROJECT" || exit 1

# Run tests based on mode
case "$MODE" in
  run)
    echo "Running tests for $PROJECT..."
    npm test
    ;;
  watch)
    echo "Running tests in watch mode for $PROJECT..."
    npm run test:watch
    ;;
  ui)
    echo "Running tests with UI for $PROJECT..."
    npm run test:ui
    ;;
  coverage)
    echo "Running tests with coverage for $PROJECT..."
    npm run coverage
    ;;
  file)
    echo "Running test file $TEST_TARGET for $PROJECT..."
    npx vitest run "$TEST_TARGET"
    ;;
  dir)
    echo "Running all tests in directory $TEST_TARGET for $PROJECT..."
    npx vitest run "$TEST_TARGET"
    ;;
esac