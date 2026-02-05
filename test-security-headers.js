import https from "https";
import http from "http";

// Test your deployed URL (replace with your actual Netlify URL)
const testUrl = process.argv[2] || "https://your-app-name.netlify.app";

console.log(`🔒 Testing security headers for: ${testUrl}`);
console.log("=".repeat(50));

function testHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        const headers = res.headers;
        const securityHeaders = {
          "Content-Security-Policy": headers["content-security-policy"],
          "X-Frame-Options": headers["x-frame-options"],
          "X-Content-Type-Options": headers["x-content-type-options"],
          "Referrer-Policy": headers["referrer-policy"],
          "Permissions-Policy": headers["permissions-policy"],
          "Strict-Transport-Security": headers["strict-transport-security"],
          "X-XSS-Protection": headers["x-xss-protection"],
          "X-Download-Options": headers["x-download-options"],
          "X-Permitted-Cross-Domain-Policies":
            headers["x-permitted-cross-domain-policies"],
          "Cross-Origin-Embedder-Policy":
            headers["cross-origin-embedder-policy"],
          "Cross-Origin-Opener-Policy": headers["cross-origin-opener-policy"],
          "Cross-Origin-Resource-Policy":
            headers["cross-origin-resource-policy"],
          "X-DNS-Prefetch-Control": headers["x-dns-prefetch-control"],
        };

        console.log("📊 Security Headers Analysis:");
        console.log("");

        let score = 0;
        let total = 0;

        Object.entries(securityHeaders).forEach(([header, value]) => {
          total++;
          if (value) {
            score++;
            console.log(`✅ ${header}: ${value}`);
          } else {
            console.log(`❌ ${header}: MISSING`);
          }
        });

        const percentage = Math.round((score / total) * 100);
        let grade = "F";

        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";

        console.log("");
        console.log(`🎯 Score: ${score}/${total} (${percentage}%)`);
        console.log(`🏆 Grade: ${grade}`);

        if (grade === "A+") {
          console.log(
            "🎉 Excellent! Your security headers are properly configured!"
          );
        } else {
          console.log(
            "⚠️  Some security headers are missing. Check your _headers file."
          );
        }

        resolve({ score, total, percentage, grade, headers: securityHeaders });
      })
      .on("error", (err) => {
        console.error("❌ Error testing headers:", err.message);
        reject(err);
      });
  });
}

// Run the test
testHeaders(testUrl).catch(console.error);
