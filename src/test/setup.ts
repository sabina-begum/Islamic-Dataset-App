/**
 * Test Setup for Security Tests
 * Configures test environment for security validation
 */

import { vi } from "vitest";

// Mock browser environment for security tests
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:5173",
    origin: "http://localhost:5173",
    protocol: "http:",
    host: "localhost:5173",
  },
  writable: true,
});

// Mock security-related APIs
Object.defineProperty(window, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
  writable: true,
});

// Mock fetch for security tests
// eslint-disable-next-line no-undef
global.fetch = vi.fn();

// Mock console for security tests
// eslint-disable-next-line no-undef
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};
