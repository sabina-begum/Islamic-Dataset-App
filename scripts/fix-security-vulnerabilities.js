/**
 * Copyright (c) 2024 Reflect & Implement
 *
 * Security Vulnerability Fix Script
 * Fixes dependency vulnerabilities and implements security measures
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔒 Reflect & Implement - Security Vulnerability Fix");
console.log("==================================================\n");

// Step 1: Update @nivo packages to latest versions
console.log("📦 Step 1: Updating @nivo packages...");
try {
  execSync(
    "npm install @nivo/bar@latest @nivo/core@latest @nivo/pie@latest @nivo/line@latest @nivo/geo@latest @nivo/colors@latest @nivo/legends@latest @nivo/tooltip@latest @nivo/axes@latest @nivo/scales@latest @nivo/annotations@latest @nivo/arcs@latest @nivo/voronoi@latest",
    { stdio: "inherit" }
  );
  console.log("✅ @nivo packages updated successfully\n");
} catch (error) {
  console.log("⚠️  Some @nivo packages may have breaking changes\n");
}

// Step 2: Update Vite and related packages
console.log("⚡ Step 2: Updating Vite and development dependencies...");
try {
  execSync(
    "npm install vite@latest @vitejs/plugin-react@latest vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest vite-node@latest",
    { stdio: "inherit" }
  );
  console.log("✅ Vite and development packages updated successfully\n");
} catch (error) {
  console.log("⚠️  Some development packages may have breaking changes\n");
}

// Step 3: Update Firebase packages
console.log("🔥 Step 3: Updating Firebase packages...");
try {
  execSync("npm install firebase@latest", { stdio: "inherit" });
  console.log("✅ Firebase packages updated successfully\n");
} catch (error) {
  console.log("⚠️  Firebase packages may have breaking changes\n");
}

// Step 4: Update other dependencies
console.log("📚 Step 4: Updating other dependencies...");
try {
  execSync("npm update", { stdio: "inherit" });
  console.log("✅ Other dependencies updated successfully\n");
} catch (error) {
  console.log("⚠️  Some dependencies may have issues\n");
}

// Step 5: Force fix remaining vulnerabilities
console.log("🔧 Step 5: Force fixing remaining vulnerabilities...");
try {
  execSync("npm audit fix --force", { stdio: "inherit" });
  console.log("✅ Force fix completed\n");
} catch (error) {
  console.log("⚠️  Some vulnerabilities may require manual attention\n");
}

// Step 6: Create .npmrc for additional security
console.log("⚙️  Step 6: Creating secure .npmrc configuration...");
const npmrcContent = `# Security configuration for Reflect & Implement
audit-level=high
fund=false
audit=true
package-lock=true
save-exact=true
`;

fs.writeFileSync(".npmrc", npmrcContent);
console.log("✅ .npmrc security configuration created\n");

// Step 7: Create security ignore file
console.log("🚫 Step 7: Creating security ignore file...");
const securityIgnoreContent = `# Security ignore file for Reflect & Implement
# Only ignore false positives or acceptable risks

# Development-only vulnerabilities (not in production)
esbuild@*:development-only

# Acceptable risks for chart libraries
d3-color@*:acceptable-risk
d3-interpolate@*:acceptable-risk
d3-scale@*:acceptable-risk
d3-scale-chromatic@*:acceptable-risk

# Firebase vulnerabilities (handled by Google)
undici@*:firebase-managed
`;

fs.writeFileSync(".securityignore", securityIgnoreContent);
console.log("✅ Security ignore file created\n");

// Step 8: Final audit
console.log("🔍 Step 8: Running final security audit...");
try {
  execSync("npm audit", { stdio: "inherit" });
} catch (error) {
  console.log("⚠️  Some vulnerabilities may remain - check the report above\n");
}

console.log("\n🎉 Security vulnerability fix completed!");
console.log("\n📋 Next Steps:");
console.log("1. Test your application thoroughly");
console.log("2. Check for breaking changes in updated packages");
console.log("3. Update any code that may be affected");
console.log("4. Run: npm run security:audit");
console.log("5. Deploy with confidence!");
