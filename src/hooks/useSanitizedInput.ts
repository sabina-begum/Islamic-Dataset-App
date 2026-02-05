import React,{ useState, useCallback } from "react";
import {
  sanitizeInput,
  sanitizeHtmlContent,
  isValidIslamicText,
} from "../utils/sanitize";

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

interface UseSanitizedInputReturn {
  value: string;
  setValue: (value: string) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  sanitizedValue: string;
  isValid: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for handling sanitized user input
 * @param options - Configuration options for sanitization
 * @returns Object with input handling functions and validation state
 */
export function useSanitizedInput(
  options: UseSanitizedInputOptions = {}
): UseSanitizedInputReturn {
  const {
    sanitizeType = "strict",
    validateIslamic = false,
    initialValue = "",
    customValidation,
  } = options;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Sanitize the input based on type
  const getSanitizedValue = useCallback(
    (inputValue: string): string => {
      switch (sanitizeType) {
        case "strict":
          return sanitizeInput(inputValue);
        case "html":
          return sanitizeHtmlContent(inputValue);
        case "islamic":
          return isValidIslamicText(inputValue)
            ? inputValue
            : sanitizeInput(inputValue);
        case "none":
          return inputValue;
        default:
          return sanitizeInput(inputValue);
      }
    },
    [sanitizeType]
  );

  // Validate the input
  const validateInput = useCallback(
    (inputValue: string): boolean => {
      if (validateIslamic && !isValidIslamicText(inputValue)) {
        setError("Input contains invalid characters for Islamic text");
        return false;
      }

      if (customValidation && !customValidation(inputValue)) {
        setError("Input validation failed");
        return false;
      }

      setError(null);
      return true;
    },
    [validateIslamic, customValidation]
  );

  // Handle input change with sanitization
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Validate the input
      validateInput(newValue);
    },
    [validateInput]
  );

  // Update value with sanitization
  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      validateInput(newValue);
    },
    [validateInput]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sanitizedValue = getSanitizedValue(value);
  const isValid =
    !error && (sanitizeType === "none" || value === sanitizedValue);

  return {
    value,
    setValue: updateValue,
    handleChange,
    sanitizedValue,
    isValid,
    error,
    clearError,
  };
}

/**
 * Hook for handling multiple sanitized inputs in a form
 * @param initialValues - Object with initial values for each field
 * @param fieldConfigs - Configuration for each field
 * @returns Object with form handling functions
 */
export function useSanitizedForm<T extends Record<string, string>>(
  initialValues: T,
  fieldConfigs: Record<keyof T, UseSanitizedInputOptions> = {} as Record<
    keyof T,
    UseSanitizedInputOptions
  >
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValid, setIsValid] = useState(true);

  const handleFieldChange = useCallback(
    (field: keyof T, value: string) => {
      const config = fieldConfigs[field] || {};
      const sanitizedValue =
        config.sanitizeType === "strict"
          ? sanitizeInput(value)
          : config.sanitizeType === "html"
          ? sanitizeHtmlContent(value)
          : value;

      setValues((prev) => ({ ...prev, [field]: sanitizedValue }));

      // Validate field
      let fieldError: string | null = null;

      if (config.validateIslamic && !isValidIslamicText(value)) {
        fieldError = "Invalid characters for Islamic text";
      } else if (config.customValidation && !config.customValidation(value)) {
        fieldError = "Validation failed";
      }

      setErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }));

      // Update overall form validity
      const newErrors = { ...errors, [field]: fieldError };
      const hasErrors = Object.values(newErrors).some(
        (error) => error !== null
      );
      setIsValid(!hasErrors);
    },
    [fieldConfigs, errors]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsValid(true);
  }, [initialValues]);

  const getSanitizedValues = useCallback((): T => {
    const sanitized: Partial<T> = {};

    Object.keys(values).forEach((key) => {
      const fieldKey = key as keyof T;
      const config = fieldConfigs[fieldKey] || {};
      const value = values[fieldKey];

      sanitized[fieldKey] = (
        config.sanitizeType === "strict"
          ? sanitizeInput(value)
          : config.sanitizeType === "html"
          ? sanitizeHtmlContent(value)
          : value
      ) as T[keyof T];
    });

    return sanitized as T;
  }, [values, fieldConfigs]);

  return {
    values,
    errors,
    isValid,
    handleFieldChange,
    resetForm,
    getSanitizedValues,
    setValues,
  };
}
