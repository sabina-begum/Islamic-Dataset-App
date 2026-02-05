#!/usr/bin/env node

/**
 * Security Headers Testing Script
 * Tests all required security headers for A+ security rating
 *
 * Usage: npm run test:headers
 */

import http from "http";
import https from "https";
import { URL } from "url";

const TEST_URL = process.env.TEST_URL || "http://localhost:5173";

// Define expected security headers
const EXPECTED_HEADERS = {
  "Content-Security-Policy": {
    required: true,
    description:
      "Protects against XSS attacks by whitelisting approved content sources",
    expectedValue: /default-src 'self'/,
    score: 25,
  },
  "X-Frame-Options": {
    required: true,
    description: "Prevents clickjacking attacks",
    expectedValue: /SAMEORIGIN/,
    score: 20,
  },
  "X-Content-Type-Options": {
    required: true,
    description: "Prevents MIME type sniffing",
    expectedValue: /nosniff/,
    score: 15,
  },
  "Referrer-Policy": {
    required: true,
    description: "Controls referrer information sent with requests",
    expectedValue: /strict-origin-when-cross-origin/,
    score: 15,
  },
  "Permissions-Policy": {
    required: true,
    description: "Controls browser features and APIs",
    expectedValue: /camera=\(\)/,
    score: 15,
  },
  "Strict-Transport-Security": {
    required: false,
    description: "Enforces HTTPS connections",
    expectedValue: /max-age=/,
    score: 10,
  },
  "X-XSS-Protection": {
    required: false,
    description: "Additional XSS protection for older browsers",
    expectedValue: /1; mode=block/,
    score: 5,
  },
  "X-Download-Options": {
    required: false,
    description: "Prevents IE from executing downloads",
    expectedValue: /noopen/,
    score: 5,
  },
  "X-Permitted-Cross-Domain-Policies": {
    required: false,
    description: "Controls cross-domain policy files",
    expectedValue: /none/,
    score: 5,
  },
  "Cross-Origin-Embedder-Policy": {
    required: false,
    description: "Controls cross-origin embedding",
    expectedValue: /require-corp/,
    score: 5,
  },
  "Cross-Origin-Opener-Policy": {
    required: false,
    description: "Controls cross-origin window opening",
    expectedValue: /same-origin/,
    score: 5,
  },
  "Cross-Origin-Resource-Policy": {
    required: false,
    description: "Controls cross-origin resource access",
    expectedValue: /same-origin/,
    score: 5,
  },
  "X-DNS-Prefetch-Control": {
    required: false,
    description: "Controls DNS prefetching",
    expectedValue: /off/,
    score: 5,
  },
};

function testHeaders(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;

    const req = client.get(url, (res) => {
      const results = {
        url: url,
        headers: {},
        score: 0,
        total: 0,
        percentage: 0,
        grade: "F",
        timestamp: new Date().toISOString(),
      };

      console.log(`\n🔍 Testing security headers for: ${url}`);
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log("\n📋 Security Headers Analysis:\n");

      let totalScore = 0;
      let maxScore = 0;

      for (const [headerName, config] of Object.entries(EXPECTED_HEADERS)) {
        const headerValue = res.headers[headerName.toLowerCase()];
        const isPresent = !!headerValue;
        const isValid = isPresent && config.expectedValue.test(headerValue);

        results.headers[headerName] = {
          present: isPresent,
          value: headerValue || "MISSING",
          score: isPresent && isValid ? config.score : 0,
        };

        if (config.required) {
          maxScore += config.score;
          totalScore += results.headers[headerName].score;
        }

        // Display results
        const status = isPresent ? (isValid ? "✅" : "⚠️") : "❌";
        const score = results.headers[headerName].score;
        const required = config.required ? "(Required)" : "(Optional)";

        console.log(`${status} ${headerName} ${required}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Value: ${headerValue || "MISSING"}`);
        console.log(`   Score: ${score}/${config.score}`);
        console.log("");

        if (!isPresent && config.required) {
          console.log(`   ❌ CRITICAL: Required header missing!`);
        } else if (isPresent && !isValid) {
          console.log(
            `   ⚠️  WARNING: Header present but value may be incorrect`
          );
        }
      }

      results.score = totalScore;
      results.total = maxScore;
      results.percentage =
        maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      results.grade = getGrade(results.percentage);

      console.log(
        `\n📈 Overall Security Score: ${results.score}/${results.total} (${results.percentage}%)`
      );
      console.log(`🏆 Grade: ${results.grade}`);

      if (results.percentage >= 90) {
        console.log(
          "🎉 Excellent! Your security headers are properly configured."
        );
      } else if (results.percentage >= 70) {
        console.log("👍 Good security, but there's room for improvement.");
      } else if (results.percentage >= 50) {
        console.log(
          "⚠️  Moderate security level. Consider implementing missing headers."
        );
      } else {
        console.log("🚨 Poor security level. Critical headers are missing!");
      }

      resolve(results);
    });

    req.on("error", (err) => {
      console.error(`❌ Error testing headers: ${err.message}`);
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 1,
      averageScore: results.percentage,
      bestGrade: results,
    },
    results: [results],
  };

  return report;
}

async function main() {
  try {
    console.log("🔒 Security Headers Testing Tool");
    console.log("================================\n");

    const results = await testHeaders(TEST_URL);
    const report = generateReport(results);

    // Save report to file
    const fs = await import("fs");
    const reportPath = "./security-headers-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(results.percentage >= 70 ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Testing failed: ${error.message}`);
    console.log("\n💡 Make sure your development server is running:");
    console.log("   npm run dev");
    process.exit(1);
  }
}

// Run the test
main();
