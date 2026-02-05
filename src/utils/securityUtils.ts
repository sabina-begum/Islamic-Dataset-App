// Enhanced security utilities for the Islamic Dataset App

/**
 * Input validation and sanitization utilities
 */
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    // Remove potentially dangerous HTML tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script\s*>)<[^<]*)*<\/script\s*>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe\s*>)<[^<]*)*<\/iframe\s*>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object\s*>)<[^<]*)*<\/object\s*>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed\s*>)<[^<]*)*<\/embed\s*>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/data:/gi, "")
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } {
    const errors: string[] = [];
    let score = 0;

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    } else {
      score += 1;
    }

    let strength: "weak" | "medium" | "strong" = "weak";
    if (score >= 4) {
      strength = "strong";
    } else if (score >= 3) {
      strength = "medium";
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Validate search query to prevent injection attacks
   */
  static validateSearchQuery(query: string): {
    isValid: boolean;
    sanitizedQuery: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitizedQuery = query;

    if (!query || typeof query !== "string") {
      return {
        isValid: false,
        sanitizedQuery: "",
        errors: ["Search query is required"],
      };
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /onclick/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        errors.push("Search query contains invalid characters");
        break;
      }
    }

    // Sanitize the query
    sanitizedQuery = this.sanitizeInput(query);

    // Limit query length
    if (sanitizedQuery.length > 500) {
      errors.push("Search query is too long (maximum 500 characters)");
      sanitizedQuery = sanitizedQuery.substring(0, 500);
    }

    return {
      isValid: errors.length === 0,
      sanitizedQuery,
      errors,
    };
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    if (typeof window !== "undefined" && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);

      for (let i = 0; i < length; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return result;
  }

  /**
   * Hash a string using a simple algorithm (for non-sensitive data)
   */
  static simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push("File size must be less than 5MB");
    }

    // Check file type
    const allowedTypes = [
      "text/plain",
      "text/csv",
      "application/json",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        "File type not allowed. Please upload a text, CSV, JSON, or PDF file."
      );
    }

    // Check file name for dangerous characters
    const dangerousChars = /[<>:"/\\|?*]/;
    if (dangerousChars.test(file.name)) {
      errors.push("File name contains invalid characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rate limiting utility
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      const userRequests = requests.get(identifier);
      if (!userRequests) {
        requests.set(identifier, [now]);
        return true;
      }
      const validRequests = userRequests.filter((time) => time > windowStart);

      if (validRequests.length >= maxRequests) {
        return false;
      }

      validRequests.push(now);
      requests.set(identifier, validRequests);
      return true;
    };
  }

  /**
   * Content Security Policy headers
   */
  static getCSPHeaders(): Record<string, string> {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
  }
}

// Export individual functions for convenience
export const sanitizeInput = SecurityUtils.sanitizeInput;
export const isValidEmail = SecurityUtils.isValidEmail;
export const validatePassword = SecurityUtils.validatePassword;
export const validateSearchQuery = SecurityUtils.validateSearchQuery;
export const generateSecureToken = SecurityUtils.generateSecureToken;
export const simpleHash = SecurityUtils.simpleHash;
export const validateFileUpload = SecurityUtils.validateFileUpload;
export const createRateLimiter = SecurityUtils.createRateLimiter;
export const getCSPHeaders = SecurityUtils.getCSPHeaders;
