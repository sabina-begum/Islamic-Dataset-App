const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting Netlify build process...");

const workerPath = path.join(
  __dirname,
  "..",
  "src",
  "workers",
  "dataProcessor.ts"
);
const backupPath = path.join(
  __dirname,
  "..",
  "src",
  "workers",
  "dataProcessor.ts.backup"
);

try {
  // Check if worker file exists
  if (fs.existsSync(workerPath)) {
    console.log("📁 Temporarily renaming worker file...");
    fs.renameSync(workerPath, backupPath);
  }

  // Run the build
  console.log("🔨 Running build...");
  execSync("tsc && vite build --mode production", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
} finally {
  // Restore worker file
  if (fs.existsSync(backupPath)) {
    console.log("📁 Restoring worker file...");
    fs.renameSync(backupPath, workerPath);
  }
}

console.log("🎉 Netlify build process completed!");
