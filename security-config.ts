/**
 * Security Configuration for Reflect & Implement
 * Comprehensive security headers and CSP configuration
 *
 * Copyright © 2025 Reflect & Implement. All rights reserved.
 */

export const securityConfig = {
  // Content Security Policy
  csp: {
    development: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com blob:",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.github.com https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),

    production: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com",
      "worker-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.github.com https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },

  // Security Headers
  headers: {
    // Required Headers
    required: {
      "Content-Security-Policy": (env) => securityConfig.csp[env],
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), autoplay=(), encrypted-media=(), fullscreen=(self), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), web-share=(), xr-spatial-tracking=()",
    },

    // Optional Headers (for enhanced security)
    optional: {
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "X-XSS-Protection": "1; mode=block",
      "X-Download-Options": "noopen",
      "X-Permitted-Cross-Domain-Policies": "none",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-DNS-Prefetch-Control": "off",
    },
  },

  // Hosting Platform Configurations
  platforms: {
    // Netlify (_headers file format)
    netlify: {
      file: "_headers",
      format: "netlify",
    },

    // Vercel (vercel.json format)
    vercel: {
      file: "vercel.json",
      format: "vercel",
    },

    // Apache (.htaccess format)
    apache: {
      file: ".htaccess",
      format: "apache",
    },

    // Nginx (nginx.conf format)
    nginx: {
      file: "nginx.conf",
      format: "nginx",
    },
  },

  // Security Recommendations
  recommendations: {
    development: [
      "✅ All required security headers are configured",
      "✅ CSP is set for development environment",
      "⚠️  Consider enabling HTTPS in development",
      "⚠️  Review CSP for any missing external resources",
    ],

    production: [
      "✅ All required security headers are configured",
      "✅ CSP is set for production environment",
      "✅ HTTPS is enforced",
      "✅ External resources are properly whitelisted",
      "✅ Frame embedding is restricted",
      "✅ MIME type sniffing is prevented",
      "✅ Referrer information is controlled",
      "✅ Browser features are restricted",
    ],
  },
};

// Helper function to generate headers for different environments
export function generateHeaders(
  environment = "development",
  includeOptional = true
) {
  const headers = { ...securityConfig.headers.required };

  // Set CSP based on environment
  headers["Content-Security-Policy"] = securityConfig.csp[environment];

  // Include optional headers if requested
  if (includeOptional) {
    Object.assign(headers, securityConfig.headers.optional);
  }

  return headers;
}

// Helper function to generate Netlify _headers file content
export function generateNetlifyHeaders(environment = "production") {
  const headers = generateHeaders(environment, true);
  let content = "# Security Headers for Reflect & Implement\n\n";

  content += "# Apply to all routes\n";
  content += "/*\n";

  Object.entries(headers).forEach(([header, value]) => {
    content += `${header}: ${value}\n`;
  });

  content += "\n# Cache Control for Static Assets\n";
  content += "*.js\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.css\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.png\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.jpg\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.svg\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.ico\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.woff\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "*.woff2\n";
  content += "Cache-Control: public, max-age=31536000, immutable\n\n";
  content += "# No Cache for HTML files\n";
  content += "*.html\n";
  content += "Cache-Control: no-cache, no-store, must-revalidate\n";
  content += "Pragma: no-cache\n";
  content += "Expires: 0\n";

  return content;
}

// Helper function to generate Vercel configuration
export function generateVercelConfig(environment = "production") {
  const headers = generateHeaders(environment, true);

  return {
    headers: [
      {
        source: "/(.*)",
        headers: Object.entries(headers).map(([key, value]) => ({
          key,
          value,
        })),
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ],
  };
}

export default securityConfig;
