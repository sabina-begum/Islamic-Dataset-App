#!/usr/bin/env node

/**
 * Simple Test Server for Security Headers
 * Tests the security headers implementation
 */

import http from "http";
import { generateHeaders } from "./security-config.ts";

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Get security headers for development environment
  const headers = generateHeaders("development", true);

  // Apply all security headers
  Object.entries(headers).forEach(([header, value]) => {
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
