import React, { useState } from "react";
import { SanitizedInput, SanitizedTextarea } from "../common/SanitizedInput";
import { sanitizeInput, isValidIslamicText } from "../../utils/sanitize";
import { escapeHtml } from "../../utils/htmlEscape";
import { runSanitizationTests } from "../../utils/testSanitization";

/**
 * Test component to demonstrate sanitization functionality
 */
export const SanitizationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];

    // Run comprehensive protocol tests
    const protocolTests = runSanitizationTests();

    // Add protocol test results
    protocolTests.results.forEach((test) => {
      const status = test.passed ? "✅" : "❌";
      results.push(
        `${status} ${test.test}: "${test.input}" → "${test.output}"`
      );
    });

    // Additional manual tests
    const xssInput = '<script>alert("XSS")</script>Hello World';
    const xssSanitized = sanitizeInput(xssInput);
    results.push(`XSS Script Test: "${xssInput}" → "${xssSanitized}"`);

    const eventInput = 'Hello<img src="x" onerror="alert(\'XSS\')">World';
    const eventSanitized = sanitizeInput(eventInput);
    results.push(`Event Handler Test: "${eventInput}" → "${eventSanitized}"`);

    const islamicText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
    const isValidIslamic = isValidIslamicText(islamicText);
    results.push(
      `Islamic Text Validation: "${islamicText}" → Valid: ${isValidIslamic}`
    );

    // Test whitespace in closing tags
    const whitespaceInput = '<script>alert("XSS")</script ><p>Hello</p>';
    const whitespaceSanitized = sanitizeInput(whitespaceInput);
    results.push(
      `Whitespace in Closing Tags: "${whitespaceInput}" → "${whitespaceSanitized}"`
    );

    // Test multiple whitespace patterns
    const multipleWhitespaceInput =
      '<script>alert("XSS1")</script><script>alert("XSS2")</script ><script>alert("XSS3")</script  >';
    const multipleWhitespaceSanitized = sanitizeInput(multipleWhitespaceInput);
    results.push(
      `Multiple Whitespace Patterns: "${multipleWhitespaceInput}" → "${multipleWhitespaceSanitized}"`
    );

    // Test HTML escaping
    const htmlInput = '<script>alert("XSS")</script>&<>"\'';
    const htmlEscaped = escapeHtml(htmlInput);
    results.push(`HTML Escaping Test: "${htmlInput}" → "${htmlEscaped}"`);

    setTestResults(results);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sanitization Test Suite
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test the security sanitization functions to ensure they work correctly
        </p>
      </div>

      {/* Test Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strict Sanitization */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Strict Sanitization (HTML Attributes)
          </h2>
          <SanitizedInput
            label="Test Input (Strict)"
            placeholder="Try: <script>alert('XSS')</script>"
            sanitizeOptions={{
              sanitizeType: "strict",
              validateIslamic: false,
            }}
            helperText="This input uses strict sanitization for HTML attributes"
          />
        </div>

        {/* HTML Content Sanitization */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            HTML Content Sanitization
          </h2>
          <SanitizedTextarea
            label="Test Input (HTML Content)"
            placeholder="Try: <p>Hello</p><script>alert('XSS')</script>"
            rows={4}
            sanitizeOptions={{
              sanitizeType: "html",
              validateIslamic: false,
            }}
            helperText="This textarea allows safe HTML but removes scripts"
          />
        </div>

        {/* Islamic Text Validation */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Islamic Text Validation
          </h2>
          <SanitizedInput
            label="Test Input (Islamic Text)"
            placeholder="Try: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            sanitizeOptions={{
              sanitizeType: "islamic",
              validateIslamic: true,
            }}
            helperText="This input validates Islamic text characters"
          />
        </div>

        {/* No Sanitization */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            No Sanitization (Unsafe)
          </h2>
          <SanitizedInput
            label="Test Input (No Sanitization)"
            placeholder="Try: <script>alert('XSS')</script>"
            sanitizeOptions={{
              sanitizeType: "none",
              validateIslamic: false,
            }}
            helperText="⚠️ This input has no sanitization (for testing only)"
          />
        </div>
      </div>

      {/* Run Tests Button */}
      <div className="text-center">
        <button
          onClick={runTests}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Run Security Tests
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Test Results
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  {result}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Security Features Implemented
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li>
            ✅ <strong>XSS Prevention:</strong> Removes script tags and event
            handlers
          </li>
          <li>
            ✅ <strong>HTML Entity Escaping:</strong> Escapes dangerous
            characters
          </li>
          <li>
            ✅ <strong>Protocol Filtering:</strong> Blocks javascript: and data:
            protocols
          </li>
          <li>
            ✅ <strong>Islamic Text Validation:</strong> Validates Arabic and
            Islamic characters
          </li>
          <li>
            ✅ <strong>Input Validation:</strong> Real-time validation with
            error messages
          </li>
          <li>
            ✅ <strong>TypeScript Support:</strong> Full type safety for all
            functions
          </li>
        </ul>
      </div>
    </div>
  );
};
