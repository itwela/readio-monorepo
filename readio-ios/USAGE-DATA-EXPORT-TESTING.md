# Usage Data Export Testing Guide

This guide provides instructions for testing the newly created data export functionality.

## Prerequisites

1. **Convex Deployment:** Ensure your Convex functions are deployed
2. **Node.js Packages:** Install required dependencies
3. **Environment Variables:** Set `CONVEX_URL` if using a custom deployment

## Installation

First, install the required npm package for the export script:

```bash
cd readio-ios
npm install convex
```

## Deployment

### Deploy to readio-ios

```bash
cd readio-ios
npx convex dev  # For development
# or
npx convex deploy  # For production
```

### Deploy to lotus-landing

```bash
cd lotus-landing
npx convex dev  # For development
# or
npx convex deploy  # For production
```

**Important:** Both projects should be deployed to the same Convex database to maintain data synchronization.

## Testing the Export Functions

### Option 1: Test via Convex Dashboard

1. Go to your Convex dashboard at https://dashboard.convex.dev
2. Navigate to your project
3. Go to the "Functions" tab
4. Find the export functions under `dataExports`:
   - `exportArticles`
   - `exportStepsLeaderboard`
   - `exportTimerPresets`
   - `exportUsersAggregated`
   - `exportComprehensiveUsageData`
5. Click on each function and test with sample arguments:

**Test `exportArticles`:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

**Test `exportStepsLeaderboard`:**
```json
{}
```

**Test `exportTimerPresets`:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

**Test `exportUsersAggregated`:**
```json
{}
```

**Test `exportComprehensiveUsageData`:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

### Option 2: Test via Export Script

Run the export script from the command line:

```bash
# Export all current data
node scripts/exportUsageData.js

# Export data for a specific date range
node scripts/exportUsageData.js --startDate=2024-01-01 --endDate=2024-12-31

# Export only comprehensive report
node scripts/exportUsageData.js --comprehensive

# Specify custom output directory
node scripts/exportUsageData.js --output=./my-exports

# Get help
node scripts/exportUsageData.js --help
```

### Option 3: Test via Convex CLI

```bash
# Test individual export functions
npx convex run dataExports:exportArticles '{"startDate": "2024-01-01T00:00:00.000Z"}'
npx convex run dataExports:exportStepsLeaderboard '{}'
npx convex run dataExports:exportTimerPresets '{}'
npx convex run dataExports:exportUsersAggregated '{}'
npx convex run dataExports:exportComprehensiveUsageData '{}'
```

## Expected Output

### Export Script Output Structure

When you run the export script, it will create a timestamped directory:

```
exports/
  2024-01-14T12-30-45/
    metadata.json
    articles.json
    steps-leaderboard.json
    timer-presets.json
    users-aggregated.json
    comprehensive-report.json
```

### Sample Output Formats

**metadata.json:**
```json
{
  "export_timestamp": "2024-01-14T12:30:45.123Z",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "convex_url": "https://brainy-kingfisher-980.convex.cloud"
}
```

**articles.json:**
```json
[
  {
    "artist": "John Doe",
    "text": "Article content here...",
    "title": "My First Article",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**steps-leaderboard.json:**
```json
[
  {
    "name": "Jane Smith",
    "step_value": 150000,
    "user_db_id": "user123"
  }
]
```

**timer-presets.json:**
```json
[
  {
    "userId": "user123",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "timerMode": "Workout",
    "name": "Morning HIIT"
  }
]
```

**users-aggregated.json:**
```json
[
  {
    "name": "John Doe",
    "user_db_ids": ["user123", "user456"],
    "account_count": 2,
    "earliest_created_at": "2024-01-01T00:00:00.000Z",
    "latest_created_at": "2024-01-15T00:00:00.000Z",
    "total_meditation_minutes": 450,
    "total_stic_voice_usage_seconds": 1200,
    "highest_meditation_streak": 15,
    "highest_giant_steps_streak": 7,
    "subscription_plans": ["blank", "starter"],
    "is_paid_subscriber": true
  }
]
```

**comprehensive-report.json:**
```json
{
  "metadata": {
    "export_date": "2024-01-14T12:30:45.123Z",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "summary": {
    "total_unique_users": 150,
    "paid_users": 45,
    "free_users": 105,
    "total_articles": 320,
    "total_timer_presets": 87,
    "total_leaderboard_entries": 150,
    "subscription_breakdown": {
      "blank": 105,
      "starter": 30,
      "premium": 15
    },
    "timer_mode_breakdown": {
      "Workout": 45,
      "Workflow": 30,
      "Work-In": 12
    }
  },
  "articles": [...],
  "steps_leaderboard": [...],
  "timer_presets": [...],
  "users": [...]
}
```

## Validation Checklist

After running exports, verify the following:

- [ ] All JSON files are valid (no syntax errors)
- [ ] Timestamp fields are in ISO 8601 format
- [ ] Users are properly aggregated by name (no duplicate names)
- [ ] Subscription plans are correctly labeled (blank, starter, premium)
- [ ] Date range filtering works correctly (if specified)
- [ ] Summary metrics in comprehensive report match individual exports
- [ ] File sizes are reasonable (not truncated)
- [ ] All expected fields are present in each export

## Troubleshooting

### Error: "Cannot find module 'convex/browser'"

**Solution:** Install the convex package:
```bash
npm install convex
```

### Error: "Failed to fetch from Convex"

**Solutions:**
1. Verify `CONVEX_URL` is correct
2. Ensure Convex functions are deployed
3. Check network connectivity
4. Verify API access permissions

### Empty or Missing Data

**Possible Causes:**
1. No data in database for the specified date range
2. Date format incorrect (should be ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ)
3. Filters too restrictive

### Users Not Properly Aggregated

**Check:**
1. User `name` field is consistent (case-sensitive)
2. `user_db_id` values are being collected correctly
3. Aggregation logic is summing metrics properly

## Integration with AI Systems

Once you have exported data, you can feed it to an AI system (like ChatGPT, Claude, etc.) for analysis:

1. **Export the data:**
   ```bash
   node scripts/exportUsageData.js --comprehensive
   ```

2. **Locate the comprehensive report:**
   ```
   exports/[timestamp]/comprehensive-report.json
   ```

3. **Prepare the AI prompt:** (see `USAGE-DATA-TRACKING-PLAN.md` for prompt templates)

4. **Feed the data to AI:**
   - Copy the JSON content
   - Paste into AI chat with appropriate context
   - Request analysis and summary generation

## Example AI Analysis Prompt

```
You are analyzing usage data for the Lotus app, an AI-powered audio content and 
wellness mobile application. The app features meditation tracking, step counting 
(Giant Steps), article generation, and timer presets.

Below is comprehensive usage data exported from our Convex database:

[PASTE JSON HERE]

Key context for interpreting the data:
- Subscription Plans:
  - "blank" = Free users (not subscribed)
  - "starter" = Bloom tier (base paid subscription)
  - "premium" = Blossom tier (premium subscription)

- Timer Modes:
  - "Workout" = Fitness/exercise timers
  - "Workflow" = Productivity timers
  - "Work-In" = Mindfulness/recovery timers

Please generate an executive summary covering:
1. User Growth & Engagement Overview
2. Feature Adoption (meditation, steps, timers, articles)
3. Subscription Metrics & Conversion Rates
4. Content Creation Trends
5. Top User Insights
6. Key Recommendations

Format the summary to be clear, data-driven, and actionable for stakeholders.
```

## Next Steps

After successful testing:

1. ✅ Verify all export functions work correctly
2. ✅ Run a full export with real production data
3. ✅ Test AI summary generation with exported data
4. ✅ Set up regular export schedule (weekly/monthly)
5. ✅ Create a template for AI prompts
6. ✅ Share summaries with stakeholders

## Maintenance

- **Regular Testing:** Test exports monthly to ensure continued functionality
- **Schema Updates:** If database schema changes, update export functions
- **Sync Check:** Verify readio-ios and lotus-landing exports remain identical
- **Archive Old Exports:** Consider retention policy for export files

