/**
 * Copyright (c) 2024 Reflect & Implement
 *
 * CSP Compliance Test Script
 * Tests Content Security Policy implementation
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🛡️  Reflect & Implement - CSP Compliance Test");
console.log("=============================================\n");

// CSP directives to test
const CSP_DIRECTIVES = {
  "default-src": ["self"],
  "script-src": [
    "self",
    "unsafe-inline",
    "unsafe-eval",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://apis.google.com",
    "blob:",
  ],
  "worker-src": ["self", "blob:"],
  "style-src": ["self", "unsafe-inline", "https://fonts.googleapis.com"],
  "font-src": ["self", "https://fonts.gstatic.com"],
  "img-src": ["self", "data:", "https:", "blob:"],
  "connect-src": [
    "self",
    "https://api.github.com",
    "https://www.google-analytics.com",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  "frame-src": ["self"],
  "object-src": ["none"],
  "base-uri": ["self"],
  "form-action": ["self"],
  "frame-ancestors": ["self"],
  "upgrade-insecure-requests": [],
};

function testCSPFile() {
  console.log("📁 Testing CSP configuration files...");

  const headersFile = path.join(__dirname, "../public/_headers");
  const viteConfig = path.join(__dirname, "../vite.config.ts");

  let score = 0;
  const total = 2;

  // Test _headers file
  if (fs.existsSync(headersFile)) {
    const content = fs.readFileSync(headersFile, "utf-8");
    if (content.includes("Content-Security-Policy")) {
      console.log("✅ public/_headers contains CSP configuration");
      score++;
    } else {
      console.log("❌ public/_headers missing CSP configuration");
    }
  } else {
    console.log("❌ public/_headers file not found");
  }

  // Test vite.config.ts
  if (fs.existsSync(viteConfig)) {
    const content = fs.readFileSync(viteConfig, "utf-8");
    if (
      content.includes("generateHeaders") ||
      content.includes("security-config")
    ) {
      console.log("✅ vite.config.ts uses centralized security configuration");
      score++;
    } else if (content.includes("Content-Security-Policy")) {
      console.log("✅ vite.config.ts contains CSP configuration");
      score++;
    } else {
      console.log("❌ vite.config.ts missing CSP configuration");
    }
  } else {
    console.log("❌ vite.config.ts file not found");
  }

  return { score, total, percentage: Math.round((score / total) * 100) };
}

function testCSPDirectives() {
  console.log("\n🔍 Testing CSP directives...");

  const headersFile = path.join(__dirname, "../public/_headers");
  if (!fs.existsSync(headersFile)) {
    console.log("❌ Cannot test directives - _headers file not found");
    return {
      score: 0,
      total: Object.keys(CSP_DIRECTIVES).length,
      percentage: 0,
    };
  }

  const content = fs.readFileSync(headersFile, "utf-8");
  const cspLine = content.match(/Content-Security-Policy:\s*(.+)/);

  if (!cspLine) {
    console.log("❌ CSP header not found in _headers file");
    return {
      score: 0,
      total: Object.keys(CSP_DIRECTIVES).length,
      percentage: 0,
    };
  }

  const cspValue = cspLine[1];
  let score = 0;
  const total = Object.keys(CSP_DIRECTIVES).length;

  Object.entries(CSP_DIRECTIVES).forEach(([directive, expectedValues]) => {
    // Special handling for directives without values (like upgrade-insecure-requests)
    if (expectedValues.length === 0) {
      const directivePattern = new RegExp(
        `${directive.replace("-", "\\-")}(?:\\s|;|$)`,
        "i"
      );
      const match = cspValue.match(directivePattern);

      if (match) {
        console.log(`✅ ${directive}: present`);
        score++;
      } else {
        console.log(`❌ ${directive}: Not found`);
      }
    } else {
      const directivePattern = new RegExp(
        `${directive.replace("-", "\\-")}\\s+['"]?([^;]+)['"]?`,
        "i"
      );
      const match = cspValue.match(directivePattern);

      if (match) {
        const values = match[1]
          .split(" ")
          .map((v) => v.trim().replace(/['"]/g, ""));
        const hasAllValues = expectedValues.every(
          (expected) => values.includes(expected) || expected === ""
        );

        if (hasAllValues) {
          console.log(`✅ ${directive}: ${values.join(", ")}`);
          score++;
        } else {
          console.log(`⚠️  ${directive}: Missing some expected values`);
        }
      } else {
        console.log(`❌ ${directive}: Not found`);
      }
    }
  });

  return { score, total, percentage: Math.round((score / total) * 100) };
}

function generateCSPReport(fileScore, directiveScore) {
  const report = {
    timestamp: new Date().toISOString(),
    fileTest: fileScore,
    directiveTest: directiveScore,
    overall: {
      score: fileScore.score + directiveScore.score,
      total: fileScore.total + directiveScore.total,
      percentage: Math.round(
        ((fileScore.score + directiveScore.score) /
          (fileScore.total + directiveScore.total)) *
          100
      ),
    },
  };

  const reportPath = path.join(__dirname, "../csp-compliance-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 CSP Report saved to: ${reportPath}`);
  return report;
}

function runCSPTests() {
  try {
    // Test CSP files
    const fileScore = testCSPFile();

    // Test CSP directives
    const directiveScore = testCSPDirectives();

    // Generate report
    const report = generateCSPReport(fileScore, directiveScore);

    // Summary
    console.log("\n🎯 CSP Compliance Summary");
    console.log("─".repeat(40));
    console.log(
      `📁 File Configuration: ${fileScore.score}/${fileScore.total} (${fileScore.percentage}%)`
    );
    console.log(
      `🔍 Directives: ${directiveScore.score}/${directiveScore.total} (${directiveScore.percentage}%)`
    );
    console.log(
      `📊 Overall: ${report.overall.score}/${report.overall.total} (${report.overall.percentage}%)`
    );

    if (report.overall.percentage >= 90) {
      console.log("🎉 Excellent CSP Implementation!");
    } else if (report.overall.percentage >= 75) {
      console.log("✅ Good CSP Implementation");
    } else {
      console.log("⚠️  CSP Implementation needs improvement");
    }

    console.log("\n📋 CSP Recommendations:");
    if (report.overall.percentage < 90) {
      console.log("• Ensure all required CSP directives are present");
      console.log("• Verify directive values match security requirements");
      console.log("• Test CSP in browser developer tools");
      console.log("• Monitor CSP violations in production");
    } else {
      console.log("• CSP is well configured");
      console.log("• Monitor for CSP violations");
      console.log("• Consider adding CSP reporting");
    }
  } catch (error) {
    console.error("❌ CSP test failed:", error.message);
  }
}

// Run tests
runCSPTests();
