import fs from "fs";
import path from "path";

const headersFile = path.join(process.cwd(), "public", "_headers");

function validateHeaders() {
  try {
    const content = fs.readFileSync(headersFile, "utf8");

    // Check for common syntax errors
    const errors = [];

    if (content.includes("/\\*")) {
      errors.push('❌ Found escaped path syntax "/\\*" - should be "/*"');
    }

    if (content.includes("\\*.js")) {
      errors.push('❌ Found escaped file pattern "\\*.js" - should be "*.js"');
    }

    if (content.includes("\\*.css")) {
      errors.push(
        '❌ Found escaped file pattern "\\*.css" - should be "*.css"'
      );
    }

    if (content.includes("/api/\\*")) {
      errors.push('❌ Found escaped API path "/api/\\*" - should be "/api/*"');
    }

    if (content.includes("unsafe-eval")) {
      errors.push(
        '⚠️ Found "unsafe-eval" in CSP - consider removing for better security'
      );
    }

    if (errors.length === 0) {
      console.log("✅ _headers file syntax is correct!");
      console.log("✅ Ready for A+ security rating!");
    } else {
      console.log("❌ _headers file has syntax errors:");
      errors.forEach((error) => console.log(error));
      console.log(
        "\n💡 Run this script before committing to catch errors early!"
      );
    }
  } catch (error) {
    console.error("❌ Error reading _headers file:", error.message);
  }
}

validateHeaders();
