// Centralized utility exports
export * from "./searchIndex";
export * from "./performanceMonitor";
export * from "./errorHandler";
export {
  isStrongPassword,
  hasPermission,
  getUserRole,
  requireAuth,
  isAdmin,
  isModerator,
  checkRateLimit,
} from "./authUtils";
export * from "./scrollUtils";
export * from "./validation";
export * from "./exportUtils";

// Explicitly re-export sanitize functions to avoid naming conflicts
export {
  sanitizeInput,
  sanitizeHtmlContent,
  isValidIslamicText,
} from "./sanitize";

// Explicitly re-export security functions to avoid naming conflicts
export {
  sanitizeInput as sanitizeInputSecurity,
  isValidEmail as isValidEmailSecurity,
  validatePassword,
  validateSearchQuery,
  generateSecureToken,
  simpleHash,
  validateFileUpload,
  createRateLimiter,
  getCSPHeaders,
} from "./securityUtils";

export * from "./htmlEscape";
