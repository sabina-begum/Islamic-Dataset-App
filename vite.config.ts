import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { generateHeaders } from "./security-config";
import type { Request, Response, NextFunction } from "express";

// Security plugin for development
const securityHeaders = () => {
  return {
    name: "security-headers",
    configureServer(server: any) {
      server.middlewares.use(
        (_req: Request, res: Response, next: NextFunction) => {
          // Get security headers for development environment
          const headers = generateHeaders("development", true);

          // Apply all security headers
          Object.entries(headers).forEach(([header, value]) => {
            res.setHeader(header, value as string);
          });

          next();
        }
      );
    },
  };
};

export default defineConfig({
  plugins: [react(), securityHeaders()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  worker: {
    format: "es",
  },
  server: {
    port: 5173,
    host: true,
    // https: false, // Set to true for HTTPS in development
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Disable source maps for security
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: [
            "@nivo/bar",
            "@nivo/core",
            "@nivo/geo",
            "@nivo/line",
            "@nivo/pie",
          ],
        },
      },
    },
    // Security optimizations
    minify: "terser",
  },
  // Security optimizations
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
