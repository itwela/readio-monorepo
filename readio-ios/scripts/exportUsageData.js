#!/usr/bin/env node

/**
 * Usage Data Export Script
 * 
 * This script connects to Convex and exports usage data from the Lotus app.
 * It generates timestamped JSON files containing all key metrics for AI analysis.
 * 
 * Usage:
 *   node scripts/exportUsageData.js [options]
 * 
 * Options:
 *   --startDate=YYYY-MM-DD    Start date for data export (optional)
 *   --endDate=YYYY-MM-DD      End date for data export (optional)
 *   --output=./path           Output directory (default: ./exports)
 *   --comprehensive           Export comprehensive report only (default: export all)
 * 
 * Examples:
 *   # Export all data from January 2024
 *   node scripts/exportUsageData.js --startDate=2024-01-01 --endDate=2024-01-31
 * 
 *   # Export comprehensive report only
 *   node scripts/exportUsageData.js --comprehensive
 * 
 *   # Export all current data
 *   node scripts/exportUsageData.js
 */

const { ConvexHttpClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");

// Convex deployment URL - update this with your actual deployment URL
const CONVEX_URL = process.env.CONVEX_URL || "https://brainy-kingfisher-980.convex.cloud";

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    startDate: undefined,
    endDate: undefined,
    output: "./exports",
    comprehensive: false
  };

  args.forEach(arg => {
    if (arg.startsWith("--startDate=")) {
      options.startDate = arg.split("=")[1];
    } else if (arg.startsWith("--endDate=")) {
      options.endDate = arg.split("=")[1];
    } else if (arg.startsWith("--output=")) {
      options.output = arg.split("=")[1];
    } else if (arg === "--comprehensive") {
      options.comprehensive = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage Data Export Script

Usage:
  node scripts/exportUsageData.js [options]

Options:
  --startDate=YYYY-MM-DD    Start date for data export (optional)
  --endDate=YYYY-MM-DD      End date for data export (optional)
  --output=./path           Output directory (default: ./exports)
  --comprehensive           Export comprehensive report only (default: export all)
  --help, -h                Show this help message

Examples:
  # Export all data from January 2024
  node scripts/exportUsageData.js --startDate=2024-01-01 --endDate=2024-01-31

  # Export comprehensive report only
  node scripts/exportUsageData.js --comprehensive

  # Export all current data
  node scripts/exportUsageData.js
      `);
      process.exit(0);
    }
  });

  return options;
}

// Create timestamped output directory
function createOutputDir(baseDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const outputDir = path.join(baseDir, timestamp);
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  fs.mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

// Save data to JSON file
function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  const fileSize = (fs.statSync(filepath).size / 1024).toFixed(2);
  console.log(`✅ Saved: ${path.basename(filepath)} (${fileSize} KB)`);
}

// Main export function
async function exportData() {
  console.log("🚀 Lotus Usage Data Export\n");
  
  const options = parseArgs();
  const client = new ConvexHttpClient(CONVEX_URL);
  
  console.log("📋 Export Configuration:");
  console.log(`   Convex URL: ${CONVEX_URL}`);
  if (options.startDate) console.log(`   Start Date: ${options.startDate}`);
  if (options.endDate) console.log(`   End Date: ${options.endDate}`);
  console.log(`   Output Directory: ${options.output}`);
  console.log(`   Mode: ${options.comprehensive ? 'Comprehensive Only' : 'Full Export'}\n`);
  
  try {
    // Create output directory
    const outputDir = createOutputDir(options.output);
    console.log(`📁 Output Directory: ${outputDir}\n`);
    
    // Export metadata
    const metadata = {
      export_timestamp: new Date().toISOString(),
      start_date: options.startDate || null,
      end_date: options.endDate || null,
      convex_url: CONVEX_URL
    };
    
    saveJSON(path.join(outputDir, "metadata.json"), metadata);
    
    if (options.comprehensive) {
      // Export only comprehensive report
      console.log("📊 Exporting comprehensive usage data...");
      const comprehensive = await client.query("dataExports:exportComprehensiveUsageData", {
        startDate: options.startDate,
        endDate: options.endDate
      });
      saveJSON(path.join(outputDir, "comprehensive-report.json"), comprehensive);
    } else {
      // Export all data sources individually
      console.log("📊 Exporting articles...");
      const articles = await client.query("dataExports:exportArticles", {
        startDate: options.startDate,
        endDate: options.endDate
      });
      saveJSON(path.join(outputDir, "articles.json"), articles);
      
      console.log("📊 Exporting steps leaderboard...");
      const leaderboard = await client.query("dataExports:exportStepsLeaderboard", {});
      saveJSON(path.join(outputDir, "steps-leaderboard.json"), leaderboard);
      
      console.log("📊 Exporting timer presets...");
      const presets = await client.query("dataExports:exportTimerPresets", {
        startDate: options.startDate,
        endDate: options.endDate
      });
      saveJSON(path.join(outputDir, "timer-presets.json"), presets);
      
      console.log("📊 Exporting users (aggregated)...");
      const users = await client.query("dataExports:exportUsersAggregated", {});
      saveJSON(path.join(outputDir, "users-aggregated.json"), users);
      
      console.log("📊 Exporting comprehensive report...");
      const comprehensive = await client.query("dataExports:exportComprehensiveUsageData", {
        startDate: options.startDate,
        endDate: options.endDate
      });
      saveJSON(path.join(outputDir, "comprehensive-report.json"), comprehensive);
    }
    
    console.log("\n✨ Export completed successfully!");
    console.log(`📂 Files saved to: ${outputDir}`);
    console.log("\n💡 Next steps:");
    console.log("   1. Review the exported JSON files");
    console.log("   2. Feed comprehensive-report.json to an AI system");
    console.log("   3. Use the AI to generate executive summaries\n");
    
  } catch (error) {
    console.error("\n❌ Export failed:", error.message);
    if (error.stack) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Run the export
exportData();

