/**
 * Security Headers Verification Script
 * Verifies that all required security headers are present in the _headers file
 */

const fs = require("fs");
const path = require("path");

const requiredHeaders = [
  "Content-Security-Policy",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
];

const optionalHeaders = [
  "Strict-Transport-Security",
  "X-XSS-Protection",
  "X-Download-Options",
  "X-Permitted-Cross-Domain-Policies",
  "Cross-Origin-Embedder-Policy",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
  "X-DNS-Prefetch-Control",
];

function checkHeaders() {
  console.log("🔍 Checking security headers configuration...\n");

  // Check if _headers file exists
  const headersPath = path.join(__dirname, "..", "dist", "_headers");
  const publicHeadersPath = path.join(__dirname, "..", "public", "_headers");

  let headersContent = "";

  if (fs.existsSync(headersPath)) {
    headersContent = fs.readFileSync(headersPath, "utf8");
    console.log("✅ Found _headers file in dist folder");
  } else if (fs.existsSync(publicHeadersPath)) {
    headersContent = fs.readFileSync(publicHeadersPath, "utf8");
    console.log("✅ Found _headers file in public folder");
  } else {
    console.log("❌ No _headers file found!");
    return false;
  }

  console.log("\n📋 Checking required headers:");

  let allRequiredPresent = true;

  requiredHeaders.forEach((header) => {
    if (headersContent.includes(header)) {
      console.log(`  ✅ ${header}`);
    } else {
      console.log(`  ❌ ${header} - MISSING`);
      allRequiredPresent = false;
    }
  });

  console.log("\n📋 Checking optional headers:");

  optionalHeaders.forEach((header) => {
    if (headersContent.includes(header)) {
      console.log(`  ✅ ${header}`);
    } else {
      console.log(`  ⚠️  ${header} - Not present (optional)`);
    }
  });

  console.log("\n📋 Checking Netlify configuration:");

  const netlifyPath = path.join(__dirname, "..", "netlify.toml");
  if (fs.existsSync(netlifyPath)) {
    console.log("  ✅ netlify.toml found");
    const netlifyContent = fs.readFileSync(netlifyPath, "utf8");

    requiredHeaders.forEach((header) => {
      if (netlifyContent.includes(header)) {
        console.log(`    ✅ ${header} in netlify.toml`);
      } else {
        console.log(`    ❌ ${header} missing from netlify.toml`);
      }
    });
  } else {
    console.log("  ⚠️  netlify.toml not found (using _headers file)");
  }

  console.log("\n🎯 Summary:");

  if (allRequiredPresent) {
    console.log("✅ All required security headers are configured!");
    console.log("🚀 Your app should have A+ security rating on deployment.");
  } else {
    console.log("❌ Some required headers are missing.");
    console.log("🔧 Please check your _headers file configuration.");
  }

  console.log("\n📝 Next steps:");
  console.log("1. Commit and push your changes to GitHub");
  console.log("2. Trigger a fresh Netlify deployment");
  console.log("3. Clear Netlify cache if needed");
  console.log("4. Test your deployed site with security headers checker");

  return allRequiredPresent;
}

// Run the check
if (require.main === module) {
  checkHeaders();
}

module.exports = { checkHeaders };
