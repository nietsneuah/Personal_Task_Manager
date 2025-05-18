// Type declarations for custom Vitest matchers

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
}

declare module 'vitest' {
  interface Assertion<T> extends CustomMatchers<T> {
    // Add any other custom matchers here
    _customMatcherBrand: void; // Dummy property to avoid ESLint error
  }
  interface AsymmetricMatchersContaining extends CustomMatchers {
    // Add any other custom matchers here
    _customMatcherBrand: void; // Dummy property to avoid ESLint error
  }
}

export {};