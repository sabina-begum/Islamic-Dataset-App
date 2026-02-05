import React from "react";
import { useSanitizedInput } from "../../hooks/useSanitizedInput";

// Define the interface locally since it's a type, not a value
interface UseSanitizedInputOptions {
  /** Type of sanitization to apply */
  sanitizeType?: "strict" | "html" | "islamic" | "none";
  /** Whether to validate Islamic text */
  validateIslamic?: boolean;
  /** Initial value */
  initialValue?: string;
  /** Custom validation function */
  customValidation?: (value: string) => boolean;
}

interface SanitizedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Sanitization options */
  sanitizeOptions?: UseSanitizedInputOptions;
  /** Callback when value changes (receives sanitized value) */
  onValueChange?: (value: string) => void;
  /** Whether to show validation errors */
  showErrors?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
}

/**
 * Sanitized input component with built-in XSS protection
 */
export const SanitizedInput: React.FC<SanitizedInputProps> = ({
  sanitizeOptions = {},
  onValueChange,
  showErrors = true,
  errorMessage,
  label,
  helperText,
  required = false,
  className = "",
  ...inputProps
}) => {
  const { value, handleChange, sanitizedValue, isValid, error, clearError } =
    useSanitizedInput(sanitizeOptions);

  // Handle change and notify parent
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (onValueChange) {
      onValueChange(sanitizedValue);
    }
  };

  // Clear error on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    clearError();
    if (inputProps.onFocus) {
      inputProps.onFocus(e);
    }
  };

  const displayError = errorMessage || error;
  const hasError = !isValid && displayError;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputProps.id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        {...inputProps}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
          ${
            hasError
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          }
          ${className}
        `}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={hasError ? `${inputProps.id}-error` : undefined}
      />

      {helperText && !hasError && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {showErrors && hasError && (
        <p
          id={`${inputProps.id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
};

interface SanitizedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  /** Sanitization options */
  sanitizeOptions?: UseSanitizedInputOptions;
  /** Callback when value changes (receives sanitized value) */
  onValueChange?: (value: string) => void;
  /** Whether to show validation errors */
  showErrors?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Label for the textarea */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the textarea is required */
  required?: boolean;
}

/**
 * Sanitized textarea component with built-in XSS protection
 */
export const SanitizedTextarea: React.FC<SanitizedTextareaProps> = ({
  sanitizeOptions = {},
  onValueChange,
  showErrors = true,
  errorMessage,
  label,
  helperText,
  required = false,
  className = "",
  ...textareaProps
}) => {
  const { value, handleChange, sanitizedValue, isValid, error, clearError } =
    useSanitizedInput(sanitizeOptions);

  // Handle change and notify parent
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    if (onValueChange) {
      onValueChange(sanitizedValue);
    }
  };

  // Clear error on focus
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    clearError();
    if (textareaProps.onFocus) {
      textareaProps.onFocus(e);
    }
  };

  const displayError = errorMessage || error;
  const hasError = !isValid && displayError;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaProps.id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        {...textareaProps}
        value={value}
        onChange={handleTextareaChange}
        onFocus={handleFocus}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical
          ${
            hasError
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          }
          ${className}
        `}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={hasError ? `${textareaProps.id}-error` : undefined}
      />

      {helperText && !hasError && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {showErrors && hasError && (
        <p
          id={`${textareaProps.id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
};
