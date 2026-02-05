/**
 * Copyright (c) 2024 Reflect & Implement
 *
 * GitHub Monitoring Script
 * Monitors for forks, stars, and potential license violations
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Configuration
const REPO_OWNER = "your-username"; // Replace with your GitHub username
const REPO_NAME = "reflect-and-implement";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set this in your environment

// File paths
const LOG_FILE = path.join(__dirname, "../VIOLATIONS_LOG.md");
const MONITOR_LOG = path.join(__dirname, "../monitoring-log.json");

class GitHubMonitor {
  constructor() {
    this.baseUrl = "https://api.github.com";
    this.headers = {
      "User-Agent": "Reflect-Implement-Monitor",
      Accept: "application/vnd.github.v3+json",
    };

    if (GITHUB_TOKEN) {
      this.headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }
  }

  // Make GitHub API request
  async makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;

      https
        .get(url, { headers: this.headers }, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  // Get repository information
  async getRepoInfo() {
    try {
      const repo = await this.makeRequest(`/repos/${REPO_OWNER}/${REPO_NAME}`);
      return {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        url: repo.html_url,
      };
    } catch (error) {
      console.error("Error fetching repo info:", error.message);
      return null;
    }
  }

  // Get forks of the repository
  async getForks() {
    try {
      const forks = await this.makeRequest(
        `/repos/${REPO_OWNER}/${REPO_NAME}/forks`
      );
      return forks.map((fork) => ({
        owner: fork.owner.login,
        name: fork.name,
        fullName: fork.full_name,
        description: fork.description,
        url: fork.html_url,
        createdAt: fork.created_at,
        updatedAt: fork.updated_at,
        stars: fork.stargazers_count,
        forks: fork.forks_count,
      }));
    } catch (error) {
      console.error("Error fetching forks:", error.message);
      return [];
    }
  }

  // Check for potential commercial use indicators
  async checkForCommercialUse(fork) {
    const commercialKeywords = [
      "premium",
      "pro",
      "enterprise",
      "commercial",
      "business",
      "subscription",
      "paid",
      "for sale",
      "buy now",
      "pricing",
      "license fee",
      "commercial license",
      "enterprise license",
    ];

    try {
      // Check README for commercial indicators
      const readme = await this.makeRequest(
        `/repos/${fork.owner}/${fork.name}/readme`
      );
      const readmeContent = Buffer.from(readme.content, "base64").toString(
        "utf-8"
      );

      const foundKeywords = commercialKeywords.filter((keyword) =>
        readmeContent.toLowerCase().includes(keyword.toLowerCase())
      );

      if (foundKeywords.length > 0) {
        return {
          fork: fork,
          keywords: foundKeywords,
          type: "README_CONTENT",
          severity: "HIGH",
        };
      }

      // Check repository description
      const descriptionKeywords = commercialKeywords.filter(
        (keyword) =>
          fork.description &&
          fork.description.toLowerCase().includes(keyword.toLowerCase())
      );

      if (descriptionKeywords.length > 0) {
        return {
          fork: fork,
          keywords: descriptionKeywords,
          type: "DESCRIPTION",
          severity: "MEDIUM",
        };
      }

      return null;
    } catch (error) {
      console.error(`Error checking fork ${fork.fullName}:`, error.message);
      return null;
    }
  }

  // Save monitoring data
  saveMonitoringData(data) {
    try {
      const timestamp = new Date().toISOString();
      const monitoringData = {
        timestamp,
        repoInfo: data.repoInfo,
        forks: data.forks,
        violations: data.violations,
      };

      fs.writeFileSync(MONITOR_LOG, JSON.stringify(monitoringData, null, 2));
      console.log(`Monitoring data saved to ${MONITOR_LOG}`);
    } catch (error) {
      console.error("Error saving monitoring data:", error.message);
    }
  }

  // Add violation to log
  addViolationToLog(violation) {
    try {
      const timestamp = new Date().toISOString();
      const violationEntry = `

**Date:** ${timestamp.split("T")[0]}
**Time:** ${timestamp.split("T")[1].split(".")[0]} UTC
**Source:** ${violation.fork.url}
**Type:** Commercial
**Description:** Potential commercial use detected in fork. Keywords found: ${violation.keywords.join(
        ", "
      )}
**Evidence:** Repository: ${violation.fork.url}, Type: ${violation.type}
**Action Taken:** None
**Status:** Open
**Notes:** Automated detection - requires manual review

---

`;

      // Read current log
      let logContent = fs.readFileSync(LOG_FILE, "utf-8");

      // Find the violation history section
      const historyMarker = "## Violation History";
      const parts = logContent.split(historyMarker);

      if (parts.length === 2) {
        // Insert violation before the closing marker
        const updatedContent =
          parts[0] + historyMarker + violationEntry + parts[1];
        fs.writeFileSync(LOG_FILE, updatedContent);
        console.log(`Violation added to log: ${violation.fork.fullName}`);
      }
    } catch (error) {
      console.error("Error adding violation to log:", error.message);
    }
  }

  // Main monitoring function
  async monitor() {
    console.log("Starting GitHub monitoring...");

    try {
      // Get repository information
      const repoInfo = await this.getRepoInfo();
      if (!repoInfo) {
        console.error("Failed to get repository information");
        return;
      }

      console.log(`Repository: ${repoInfo.fullName}`);
      console.log(`Stars: ${repoInfo.stars}, Forks: ${repoInfo.forks}`);

      // Get forks
      const forks = await this.getForks();
      console.log(`Found ${forks.length} forks`);

      // Check for violations
      const violations = [];
      for (const fork of forks) {
        const violation = await this.checkForCommercialUse(fork);
        if (violation) {
          violations.push(violation);
          console.log(`⚠️  Potential violation in ${fork.fullName}`);
          this.addViolationToLog(violation);
        }
      }

      // Save monitoring data
      this.saveMonitoringData({
        repoInfo,
        forks,
        violations,
      });

      console.log(
        `Monitoring complete. Found ${violations.length} potential violations.`
      );
    } catch (error) {
      console.error("Monitoring failed:", error.message);
    }
  }
}

// Run monitoring if script is executed directly
if (require.main === module) {
  const monitor = new GitHubMonitor();
  monitor.monitor();
}

module.exports = GitHubMonitor;
