/**
 * Removes control characters from a string
 * @param str - The string to clean
 * @returns String with control characters removed
 */
function removeControlCharacters(str: string): string {
  // Remove control characters (0-31 and 127) using a different approach
  return str
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("");
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for HTML attributes
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input
    // Remove HTML tags and their content
    .replace(/<[^>]*>/g, "")
    // Remove script tags and their content (handles whitespace in closing tags)
    .replace(/<script[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, "")
    // Remove data: protocol
    .replace(/data:/gi, "")
    // Remove all event handlers (onXXX=)
    .replace(/on\w+\s*=/gi, "")
    // Remove CSS expressions
    .replace(/expression\s*\(/gi, "")
    // Remove eval() calls
    .replace(/eval\s*\(/gi, "")
    // Remove dangerous CSS properties
    .replace(/url\s*\(/gi, "")
    // Remove potential SQL injection patterns
    .replace(/['";]/g, "")
    // Remove backticks (can be used for template injection)
    .replace(/`/g, "")
    // Remove angle brackets
    .replace(/[<>]/g, "")
    // Remove ampersands (can be used for HTML entity injection)
    .replace(/&/g, "&amp;")
    // Remove quotes
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    // Remove backslashes
    .replace(/\\/g, "")
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Remove control characters
  sanitized = removeControlCharacters(sanitized);

  // Additional check for any remaining dangerous patterns
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /eval\s*\(/gi,
  ];

  // If any dangerous patterns remain, remove them completely
  dangerousPatterns.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, "");
    }
  });

  return sanitized;
}

/**
 * Sanitizes input specifically for HTML content (less restrictive than attribute sanitization)
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for HTML content
 */
export function sanitizeHtmlContent(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  const result = input
    // Remove script tags and their content (handles whitespace in closing tags)
    .replace(/<script[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, "")
    // Remove data: protocol
    .replace(/data:/gi, "")
    // Remove all event handlers (onXXX=)
    .replace(/on\w+\s*=/gi, "")
    // Remove CSS expressions
    .replace(/expression\s*\(/gi, "")
    // Remove eval() calls
    .replace(/eval\s*\(/gi, "")
    // Remove dangerous CSS properties
    .replace(/url\s*\(/gi, "")
    // Remove null bytes
    .replace(/\0/g, "")
    .trim();

  // Remove control characters
  return removeControlCharacters(result);
}

/**
 * Validates if input contains only safe characters for Islamic text
 * @param input - The user input to validate
 * @returns true if input is safe for Islamic text display
 */
export function isValidIslamicText(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  // Allow Arabic characters, English letters, numbers, and basic punctuation
  // Use a simpler approach that avoids complex Unicode ranges
  const safeRanges = [
    [0x0600, 0x06ff], // Arabic
    [0x0750, 0x077f], // Arabic Supplement
    [0x08a0, 0x08ff], // Arabic Extended-A
    [0xfb50, 0xfdff], // Arabic Presentation Forms-A
    [0xfe70, 0xfeff], // Arabic Presentation Forms-B
    [0x0020, 0x007e], // Basic Latin
    [0x00a0, 0x00ff], // Latin-1 Supplement
    [0x0100, 0x017f], // Latin Extended-A
    [0x0180, 0x024f], // Latin Extended-B
    [0x1e00, 0x1eff], // Latin Extended Additional
  ];

  // Check if each character in the input is within a safe range
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const isSafe = safeRanges.some(
      ([start, end]) => charCode >= start && charCode <= end
    );
    if (!isSafe) {
      return false;
    }
  }

  return true;
}
