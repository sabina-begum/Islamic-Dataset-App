#!/usr/bin/env node

/**
 * Quick Security Headers Test
 * Tests security headers and provides immediate feedback
 */

import http from "http";
import https from "https";

const TEST_URL =
  process.argv[2] || process.env.TEST_URL || "http://localhost:5173";

const REQUIRED_HEADERS = [
  "Content-Security-Policy",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
];

const OPTIONAL_HEADERS = [
  "Strict-Transport-Security",
  "X-XSS-Protection",
  "X-Download-Options",
  "X-Permitted-Cross-Domain-Policies",
  "Cross-Origin-Embedder-Policy",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
  "X-DNS-Prefetch-Control",
];

function testHeaders() {
  return new Promise((resolve, reject) => {
    const client = http;

    const req = client.get(TEST_URL, (res) => {
      console.log(`\n🔍 Testing security headers for: ${TEST_URL}`);
      console.log(`📊 Response Status: ${res.statusCode}\n`);

      let requiredScore = 0;
      let optionalScore = 0;

      console.log("📋 Required Headers:");
      REQUIRED_HEADERS.forEach((header) => {
        const value = res.headers[header.toLowerCase()];
        const present = !!value;
        if (present) requiredScore++;

        const status = present ? "✅" : "❌";
        console.log(`  ${status} ${header}: ${value || "MISSING"}`);
      });

      console.log("\n📋 Optional Headers:");
      OPTIONAL_HEADERS.forEach((header) => {
        const value = res.headers[header.toLowerCase()];
        const present = !!value;
        if (present) optionalScore++;

        const status = present ? "✅" : "⚠️";
        console.log(`  ${status} ${header}: ${value || "MISSING"}`);
      });

      const requiredPercentage = Math.round(
        (requiredScore / REQUIRED_HEADERS.length) * 100
      );
      const optionalPercentage = Math.round(
        (optionalScore / OPTIONAL_HEADERS.length) * 100
      );

      console.log(
        `\n📈 Required Headers: ${requiredScore}/${REQUIRED_HEADERS.length} (${requiredPercentage}%)`
      );
      console.log(
        `📈 Optional Headers: ${optionalScore}/${OPTIONAL_HEADERS.length} (${optionalPercentage}%)`
      );

      if (requiredPercentage === 100) {
        console.log("🎉 All required security headers are present!");
      } else {
        console.log("⚠️  Some required security headers are missing.");
      }

      resolve({
        required: requiredScore,
        optional: optionalScore,
        requiredPercentage,
        optionalPercentage,
      });
    });

    req.on("error", (err) => {
      console.error(`❌ Error: ${err.message}`);
      console.log("\n💡 Make sure your development server is running:");
      console.log("   npm run dev");
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function main() {
  try {
    console.log("🔒 Quick Security Headers Test");
    console.log("==============================");

    await testHeaders();
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

main();
