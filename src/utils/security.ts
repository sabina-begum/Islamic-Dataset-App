/**
 * Copyright (c) 2024 Reflect & Implement
 *
 * Security utilities for input validation and sanitization
 */

// Security constants
export const SECURITY_CONFIG = {
  // CSP nonce for inline scripts (if needed)
  CSP_NONCE: "reflect-implement-nonce",

  // Allowed domains for external resources
  ALLOWED_DOMAINS: [
    "reflectandimplement.com",
    "api.github.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "www.googletagmanager.com",
    "www.google-analytics.com",
  ],

  // Maximum input lengths
  MAX_INPUT_LENGTHS: {
    search: 500,
    title: 200,
    description: 1000,
    url: 2048,
    email: 254,
  },

  // Rate limiting
  RATE_LIMITS: {
    search: 100, // requests per minute
    api: 60, // requests per minute
    auth: 5, // login attempts per minute
  },
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  alphanumeric: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  search: /^[a-zA-Z0-9\s\-_.,!?()@#$%^&*()[\]{}|\\:;"'<>?/]+$/,
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  return (
    VALIDATION_PATTERNS.email.test(email) &&
    email.length <= SECURITY_CONFIG.MAX_INPUT_LENGTHS.email
  );
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return SECURITY_CONFIG.ALLOWED_DOMAINS.some(
      (domain) =>
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validate search input
 */
export function validateSearchInput(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  return (
    input.length <= SECURITY_CONFIG.MAX_INPUT_LENGTHS.search &&
    VALIDATION_PATTERNS.search.test(input)
  );
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== "string") {
    return "";
  }

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Hash sensitive data (for client-side validation)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate and sanitize search filters
 */
export function validateSearchFilters(filters: any): any {
  const sanitized: any = {};

  if (filters.searchTerm) {
    const sanitizedTerm = sanitizeInput(filters.searchTerm);
    if (validateSearchInput(sanitizedTerm)) {
      sanitized.searchTerm = sanitizedTerm;
    }
  }

  if (filters.type && typeof filters.type === "string") {
    sanitized.type = sanitizeInput(filters.type);
  }

  if (filters.sortBy && typeof filters.sortBy === "string") {
    const allowedSortBy = ["title", "type", "date", "relevance"];
    if (allowedSortBy.includes(filters.sortBy)) {
      sanitized.sortBy = filters.sortBy;
    }
  }

  return sanitized;
}

/**
 * Rate limiting utility (client-side)
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, limit: number, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const requests = this.requests.get(key)!;
    const recentRequests = requests.filter((time) => time > windowStart);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  clear(): void {
    this.requests.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Security headers configuration for fetch requests
 */
export const SECURE_FETCH_CONFIG = {
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  credentials: "same-origin" as "same-origin" | "include" | "omit",
};

/**
 * Secure fetch wrapper with validation
 */
export async function secureFetch(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | FormData | URLSearchParams | ReadableStream;
    mode?: "cors" | "no-cors" | "same-origin";
    credentials?: "same-origin" | "include" | "omit";
    cache?:
      | "default"
      | "no-store"
      | "reload"
      | "no-cache"
      | "force-cache"
      | "only-if-cached";
    redirect?: "follow" | "error" | "manual";
    referrer?: string;
    referrerPolicy?:
      | "no-referrer"
      | "no-referrer-when-downgrade"
      | "origin"
      | "origin-when-cross-origin"
      | "same-origin"
      | "strict-origin"
      | "strict-origin-when-cross-origin"
      | "unsafe-url";
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<Response> {
  // Validate URL
  if (!validateUrl(url)) {
    throw new Error("Invalid URL");
  }

  // Rate limiting
  if (!rateLimiter.isAllowed("api", SECURITY_CONFIG.RATE_LIMITS.api)) {
    throw new Error("Rate limit exceeded");
  }

  // Merge with secure config
  const secureOptions = {
    ...SECURE_FETCH_CONFIG,
    ...options,
    headers: {
      ...SECURE_FETCH_CONFIG.headers,
      ...options.headers,
    },
  };

  return fetch(url, secureOptions);
}
