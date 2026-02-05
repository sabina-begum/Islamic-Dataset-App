import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "../public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, "optimized");

// Image optimization configuration
const SIZES = [480, 768, 1024, 1440];
const QUALITY = {
  webp: 85,
  jpeg: 80,
  png: 90,
};

/**
 * Convert and optimize images to multiple formats and sizes
 */
async function optimizeImages() {
  console.log("🖼️  Starting image optimization...");

  try {
    // Ensure optimized directory exists
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

    // Find all images in assets directory
    const imageExtensions = [".jpg", ".jpeg", ".png", ".svg"];
    const files = await findImageFiles(ASSETS_DIR, imageExtensions);

    console.log(`📁 Found ${files.length} images to optimize`);

    let optimizedCount = 0;
    let totalSavings = 0;

    for (const filePath of files) {
      const savings = await processImage(filePath);
      totalSavings += savings;
      optimizedCount++;

      const progress = Math.round((optimizedCount / files.length) * 100);
      console.log(
        `⚡ Progress: ${progress}% (${optimizedCount}/${files.length})`
      );
    }

    console.log(`✅ Optimization complete!`);
    console.log(`📊 Total images processed: ${optimizedCount}`);
    console.log(`💾 Total size reduction: ${formatBytes(totalSavings)}`);
  } catch (error) {
    console.error("❌ Image optimization failed:", error);
    process.exit(1);
  }
}

/**
 * Find all image files recursively
 */
async function findImageFiles(dir, extensions) {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await findImageFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (
        extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or is not accessible
    console.warn(`⚠️  Could not access directory: ${dir}`);
  }

  return files;
}

/**
 * Process a single image file
 */
async function processImage(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const extension = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const outputDir = path.join(OPTIMIZED_DIR, path.dirname(relativePath));

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  let totalSavings = 0;

  try {
    const originalStats = await fs.stat(filePath);
    console.log(
      `🔄 Processing: ${relativePath} (${formatBytes(originalStats.size)})`
    );

    // Skip SVG files - just copy them
    if (extension === ".svg") {
      const outputPath = path.join(outputDir, path.basename(filePath));
      await fs.copyFile(filePath, outputPath);
      console.log(`📋 Copied SVG: ${path.basename(filePath)}`);
      return 0;
    }

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Generate responsive images in WebP format
    for (const size of SIZES) {
      if (metadata.width && size <= metadata.width) {
        // WebP version
        const webpPath = path.join(outputDir, `${fileName}-${size}w.webp`);
        await image
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY.webp })
          .toFile(webpPath);

        // Original format version
        const originalPath = path.join(
          outputDir,
          `${fileName}-${size}w${extension}`
        );
        const quality = extension === ".png" ? QUALITY.png : QUALITY.jpeg;

        if (extension === ".png") {
          await image
            .resize(size, null, { withoutEnlargement: true })
            .png({ quality, compressionLevel: 9 })
            .toFile(originalPath);
        } else {
          await image
            .resize(size, null, { withoutEnlargement: true })
            .jpeg({ quality, progressive: true })
            .toFile(originalPath);
        }

        // Calculate savings for WebP
        const webpStats = await fs.stat(webpPath);
        const originalStats = await fs.stat(originalPath);
        totalSavings += originalStats.size - webpStats.size;
      }
    }

    // Create optimized version of original size
    const optimizedPath = path.join(
      outputDir,
      `${fileName}-optimized${extension}`
    );

    if (extension === ".png") {
      await image
        .png({ quality: QUALITY.png, compressionLevel: 9 })
        .toFile(optimizedPath);
    } else {
      await image
        .jpeg({ quality: QUALITY.jpeg, progressive: true })
        .toFile(optimizedPath);
    }

    const optimizedStats = await fs.stat(optimizedPath);
    const originalSize = originalStats.size;
    const optimizedSize = optimizedStats.size;
    const savings = originalSize - optimizedSize;

    console.log(
      `✨ Optimized: ${path.basename(filePath)} (${formatBytes(savings)} saved)`
    );

    return totalSavings + savings;
  } catch (error) {
    console.error(`❌ Failed to process ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Run optimization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeImages();
}

export { optimizeImages };
