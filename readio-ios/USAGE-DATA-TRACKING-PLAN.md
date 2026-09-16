# Usage Data Tracking & AI Summary Generation Plan

## Overview

This document outlines a plan for tracking app usage data and generating reliable data exports that can be fed to AI systems to create executive summaries for stakeholders (e.g., your dad/DA).

## Current State Assessment

### ✅ Existing Data Sources

The app already tracks significant usage data across multiple tables in Convex:

1. **User Data (`users` table)**
   - Subscription plans (blank/starter/premium)
   - Article generation usage (`article_generation_runs`, limits, resets)
   - Meditation minutes (`user_meditation_minutes`)
   - Steps tracking (`usersteps`)
   - Voice usage seconds (`stic_voice_usage_seconds`)
   - Streak data (meditation & giant steps)
   - Activity stats (JSON arrays for meditation & giant steps)
   - User creation timestamps

2. **Content Analytics (`content_analytics` table)**
   - Play tokens (tracking play events)
   - Complete tokens (tracking completion events)
   - Content type tracking
   - Last played timestamps

3. **User Progress (`user_progress` table)**
   - Playback positions for audiobooks, liner notes, articles
   - Chapter-level progress tracking
   - Last updated timestamps

4. **Content Tracking (`content_tracking` table)**
   - User engagement with different content types
   - Creation timestamps

5. **User Feedback (`user_feedback_surveys` table)**
   - Survey responses with engagement metrics
   - Value ratings, feature usage, etc.

6. **Other Engagement Data**
   - Articles created (`articles` table)
   - Playlists created (`playlists` table)
   - Favorites (`favorites` table)
   - Upvotes (`upvotes` table)
   - Timer presets usage (`timer_presets` table)

## Priority Data Fields for Export

Based on stakeholder requirements, the following fields are prioritized for data exports and AI-generated summaries:

### Articles (`articles` table)
**Key Fields:**
- `artist` - The user's name who created the article (identifies content creators)
- `text` - Full article text (enables AI topic analysis and content trends)
- `title` - Article title (quick reference for popular topics)
- `created_at` - Creation timestamp (tracks content creation activity and recency)

**Use Cases:**
- Analyze what topics users are creating articles about
- Identify most active content creators
- Track content creation frequency and trends
- Generate summaries of popular themes and interests

### Steps Leaderboard (`steps_leaderboard` table)
**Key Fields:**
- `name` - User name on leaderboard
- `step_value` - Total step count for the user
- `user_db_id` - User database identifier (links to user accounts)

**Use Cases:**
- Track engagement with the Giant Steps feature
- Identify most active users by physical activity
- Measure community engagement in fitness challenges
- Highlight leaderboard competition trends

### Timer Presets (`timer_presets` table)
**Key Fields:**
- `userId` - User who created the preset (identifies feature adopters)
- `createdAt` - Creation timestamp (tracks feature usage over time)
- `timerMode` - Mode type: 'Workout', 'Workflow', or 'Work-In' (usage patterns)
- `name` - User-given name for the preset (creative usage insights)

**Use Cases:**
- Understand which timer modes are most popular
- Track timer feature adoption rates
- Identify power users who create multiple presets
- Analyze naming patterns to understand use cases

### Users (`users` table - Aggregated by Name)
**Key Fields:**
- `user_db_id` - Unique user identifier
- `created_at` - Account creation date
- `giant_steps_current_streak` - Active walking meditation streak
- `giant_steps_highest_streak` - Best walking streak achieved
- `meditation_current_streak` - Active meditation streak
- `meditation_highest_streak` - Best meditation streak achieved
- `name` - User's display name
- `stic_voice_usage_seconds` - AI voice generation usage
- `subscription_plan` - Subscription tier (see below)
- `user_meditation_minutes` - Total meditation time

**Subscription Plan Values:**
- `blank` = No subscription (free user)
- `starter` = Bloom tier (base paid subscription)
- `premium` = Blossom tier (premium subscription)

**Use Cases:**
- Calculate conversion rates (free → paid)
- Measure feature adoption (meditation vs steps)
- Track user retention through streak data
- Understand AI voice feature usage
- Identify power users and inactive accounts

**Note on User Aggregation:**
Since multiple accounts may share the same name, user data is aggregated by the `name` field to avoid duplicates. This aggregation:
- Combines all `user_db_id` values under one name
- Sums total meditation minutes and voice usage
- Tracks highest streaks across all accounts
- Lists all subscription plans associated with that name
- Includes both earliest and latest account creation dates

## Recommended Implementation Plan

### Phase 1: Data Export Infrastructure

#### 1.1 Create Convex Data Export Functions

**Goal:** Create reliable, queryable functions to export usage data in structured formats (JSON/CSV).

**Tasks:**
- Create `convex/dataExports.ts` with export functions:
  - `exportUserMetrics` - Aggregate user-level metrics
  - `exportContentAnalytics` - Content engagement metrics
  - `exportSubscriptionMetrics` - Subscription and revenue metrics
  - `exportEngagementMetrics` - Daily/weekly/monthly engagement trends
  - `exportFeatureUsage` - Feature-level usage breakdown

**Data Format Considerations:**
- JSON format for AI processing (structured, easy to parse)
- Include date ranges for time-based analysis
- Aggregate data at appropriate levels (daily, weekly, monthly)
- Include metadata (export date, data freshness indicators)

#### 1.2 Create Comprehensive Usage Report Query

**Goal:** Single function that aggregates all relevant metrics into one report.

**Function:** `getComprehensiveUsageReport`
- Parameters: `startDate`, `endDate`, `aggregationLevel` (daily/weekly/monthly)
- Returns: Structured object with all key metrics

**Metrics to Include:**
- **User Metrics:**
  - Total active users (by subscription tier)
  - New user signups
  - User retention metrics
  - Subscription conversions (free → paid)
  
- **Engagement Metrics:**
  - Total play sessions
  - Content completion rates
  - Average session duration (estimate from progress data)
  - Most popular content types
  - Article generation usage
  
- **Feature Usage:**
  - Meditation usage (total minutes, active users)
  - Giant Steps usage (total steps, active users)
  - Timer usage (presets created, usage frequency)
  - Playlist creation and usage
  - Favorite/upvote engagement
  
- **Content Metrics:**
  - Total articles created
  - Total content items consumed
  - Top performing content
  - Content categories popularity

### Phase 2: Data Export Scripts

#### 2.1 Command-Line Export Script

**Goal:** Create a Node.js script that can be run to export data locally.

**Location:** `scripts/exportUsageData.js`

**Functionality:**
- Connect to Convex
- Call export functions
- Save data to JSON files with timestamps
- Option to specify date ranges
- Output multiple files (one per metric category)

**Usage:**
```bash
node scripts/exportUsageData.js --startDate 2024-01-01 --endDate 2024-12-31 --format json
```

#### 2.2 Export Data Structure

**Recommended File Structure:**
```
exports/
  YYYY-MM-DD_HHMMSS/
    comprehensive-report.json
    user-metrics.json
    content-analytics.json
    subscription-metrics.json
    engagement-trends.json
    feature-usage.json
    metadata.json
```

### Phase 3: AI Summary Generation

#### 3.1 Create Data Interpretation Guide

**Goal:** Document how to interpret the exported data for AI systems.

**Create:** `DATA-INTERPRETATION-GUIDE.md`

**Contents:**
- Data dictionary (what each field means)
- Calculation explanations (how metrics are derived)
- Context for metrics (what's considered "good")
- Key insights to highlight
- Common patterns to identify

**Example Structure:**
```markdown
## User Metrics

### activeUsers
- **Definition:** Users who have engaged with content in the period
- **Calculation:** Count of distinct users with activity in time range
- **Context:** Higher is better, typically ranges from X to Y
- **AI Prompt Guidance:** "Highlight significant growth (>20%) or decline"

### subscriptionTiers
- **Definition:** Breakdown of users by subscription level
- **Structure:** {blank: X, starter: Y, premium: Z}
- **Key Insight:** Premium conversion rate = premium / total
- **AI Prompt Guidance:** "Compare conversion rates and identify trends"
```

#### 3.2 AI Prompt Template

**Goal:** Create a reusable prompt template for generating summaries.

**Template Components:**
1. **Context Setting:**
   - App description
   - Time period being analyzed
   - Data source information

2. **Data Instructions:**
   - Reference to data interpretation guide
   - Expected data structure
   - Key metrics to analyze

3. **Output Format:**
   - Executive summary format
   - Sections to include
   - Detail level (high-level vs detailed)

4. **Tone & Style:**
   - Professional but accessible
   - Focus on actionable insights
   - Highlight both positives and areas for improvement

**Example Prompt Structure:**
```
You are analyzing usage data for the Lotus app, an AI-powered audio content 
and wellness app. Below is usage data from [DATE RANGE].

Data Context:
- [Brief app description]
- [Key metrics explanation]
- [Data interpretation guide reference]

Data Provided:
[JSON DATA HERE]

Please generate an executive summary covering:
1. Key Highlights (3-5 bullet points)
2. User Growth & Engagement
3. Feature Usage Breakdown
4. Content Performance
5. Subscription Metrics
6. Trends & Insights
7. Recommendations

Format: Professional, concise, data-driven
```

### Phase 4: Automation (Optional Future Enhancement)

#### 4.1 Scheduled Exports

**Goal:** Automate regular data exports.

**Options:**
- Convex cron jobs (if available) to generate weekly/monthly reports
- GitHub Actions workflow to run export scripts
- Simple cron job on local machine/server

#### 4.2 Automated AI Summaries

**Goal:** Automatically generate and deliver summaries.

**Workflow:**
1. Scheduled export runs
2. Data files generated
3. AI API call (OpenAI, Anthropic, etc.) generates summary
4. Summary saved/emailed/shared

## Implementation Priorities

### Must-Have (MVP)
1. ✅ Create comprehensive usage report query function
2. ✅ Create data export script (basic JSON export)
3. ✅ Create data interpretation guide
4. ✅ Create AI prompt template

### Nice-to-Have
5. ✅ Multiple export formats (CSV, JSON)
6. ✅ Automated scheduling
7. ✅ Data visualization support (charts/graphs)
8. ✅ Historical trend analysis functions

## Data Privacy & Security Considerations

- **User Privacy:** Ensure exports don't include PII (emails can be hashed/anonymized)
- **Access Control:** Export functions should require admin privileges
- **Data Retention:** Decide on export retention policy
- **Sharing:** Consider how summaries will be shared (secure sharing methods)

## Key Metrics to Track

### User Acquisition & Growth
- New user signups (daily/weekly/monthly)
- Active users (DAU, WAU, MAU)
- User retention (7-day, 30-day retention rates)

### Engagement
- Session frequency (sessions per user)
- Content consumption (plays, completions)
- Feature adoption rates
- Average session duration

### Monetization
- Subscription conversion rates
- Revenue by tier
- Churn rates
- Lifetime value indicators

### Content Performance
- Most popular content types
- Completion rates by content type
- Content creation activity
- User-generated content metrics

### Feature Usage
- Meditation engagement
- Steps/activity tracking usage
- Timer usage
- Playlist creation and usage
- Article generation usage

## Next Steps

1. **Review this plan** and adjust priorities based on needs
2. **Implement Phase 1** (Data Export Infrastructure)
   - Start with comprehensive usage report query
   - Test with sample data
3. **Create Phase 2** (Export Scripts)
   - Build basic export script
   - Test data export process
4. **Develop Phase 3** (AI Summary)
   - Create interpretation guide
   - Build prompt template
   - Test with actual data
5. **Iterate** based on feedback and needs

## Questions to Consider

1. **Frequency:** How often do you need these summaries? (Daily, weekly, monthly?)
2. **Scope:** What level of detail is needed? (High-level overview vs detailed breakdown)
3. **Format:** How should summaries be delivered? (Email, document, dashboard?)
4. **Historical Context:** Should summaries include comparisons to previous periods?
5. **Custom Metrics:** Are there specific metrics your dad/DA cares most about?
6. **Access:** Who needs access to raw data vs summaries only?

## Technical Notes

### Convex Considerations
- Use Convex query functions for read operations
- Consider pagination for large datasets
- Use indexes for efficient queries
- Cache aggregated metrics if needed

### Data Quality
- Validate data completeness
- Handle missing/null values appropriately
- Document any data quality issues
- Include data freshness indicators

### Performance
- Optimize queries for large datasets
- Consider incremental exports (only new/changed data)
- Test export performance with production data volumes


