import '@testing-library/react';

// Global test setup
// This file is executed before each test file

// Add any global mocks here
// For example, if you need to mock localStorage:
/*
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
*/

// Add any global setup for testing-library
// For example, to configure custom matchers:
/*
import { configure } from '@testing-library/react';
configure({
  testIdAttribute: 'data-testid',
});
*/

// Suppress specific console messages during tests if needed
// For example, to suppress React warning messages:
/*
const originalConsoleError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalConsoleError(...args);
};
*/