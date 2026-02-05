#!/usr/bin/env node

/**
 * Simple Security Headers Test
 * Tests security headers implementation directly
 */

import http from "http";

const PORT = 3001;

// Security headers configuration
const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.github.com https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(self), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), web-share=(), xr-spatial-tracking=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "X-Download-Options": "noopen",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const server = http.createServer((req, res) => {
  // Apply all security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // Set content type
  res.setHeader("Content-Type", "text/html");

  // Send response
  res.writeHead(200);
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Security Headers Test</title>
    </head>
    <body>
      <h1>Security Headers Test</h1>
      <p>This page is protected by comprehensive security headers.</p>
      <script>
        console.log('Security headers test page loaded');
      </script>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`🔒 Test server running on http://localhost:${PORT}`);
  console.log("📋 Security headers are applied to all responses");
  console.log("🛑 Press Ctrl+C to stop the server");
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down test server...");
  server.close(() => {
    console.log("✅ Test server stopped");
    process.exit(0);
  });
});
