# Convex Database Schema Synchronization Guide

## 🎯 Problem Solved

Both `readio-ios` and `lotus-landing` projects share the same Convex database, but previously had different schemas. When deploying one project, it would overwrite tables needed by the other project.

## ✅ Solution Implemented

Both projects now have **identical schemas** that include ALL tables needed by both applications:

### Unified Tables (in both projects)
- ✅ `users` - User accounts and authentication
- ✅ `articles` - User-generated articles
- ✅ `playlists` - User playlists
- ✅ `favorites` - Favorited articles
- ✅ `upvotes` - Article upvotes
- ✅ `liner_notes` - Audio liner notes content
- ✅ `audiobooks` - Audiobook content
- ✅ `meditations` - Meditation sessions
- ✅ `fithop` - FitHop music albums
- ✅ `content_analytics` - Content usage tracking
- ✅ `env_variables` - Environment configuration
- ✅ `steps` - Global step tracking
- ✅ `steps_leaderboard` - Step leaderboard data
- ✅ `waitlist` - Landing page waitlist
- ✅ `request_locks` - Rate limiting
- ✅ `communityPlaylists` - Community playlists
- ✅ `content_tracking` - Content tracking data
- ✅ `user_progress` - User progress tracking (audiobooks, liner notes, articles)
- ✅ `timer_presets` - Timer presets (from readio-ios)
- ✅ `user_feedback_surveys` - User feedback surveys (from lotus-landing)

## 📁 Files Synchronized

### Schema Files
- `readio-ios/convex/schema.ts` ✅ Updated
- `lotus-landing/convex/schema.ts` ✅ Updated

### Convex Function Files Added

#### Added to `lotus-landing`:
- ✅ `lotus-landing/convex/timerPresets.ts` (copied from readio-ios)

#### Added to `readio-ios`:
- ✅ `readio-ios/convex/userFeedbackSurveys.ts` (copied from lotus-landing)

## 🔧 How to Maintain Synchronization

### When Adding a New Table

1. **Add to BOTH schema files:**
   - Update `readio-ios/convex/schema.ts`
   - Update `lotus-landing/convex/schema.ts`

2. **Create corresponding Convex function files in BOTH projects:**
   - Create `readio-ios/convex/yourNewTable.ts`
   - Create `lotus-landing/convex/yourNewTable.ts`

3. **Keep function files identical** (unless there's a specific reason they need to differ)

### Deployment Checklist

Before deploying either project:

1. ✅ Verify schemas are identical:
   ```bash
   diff readio-ios/convex/schema.ts lotus-landing/convex/schema.ts
   ```
   (Should show no output if identical)

2. ✅ Check that all Convex function files exist in both projects

3. ✅ Run `npx convex dev` in both projects to verify no errors

### Best Practices

1. **Always update both projects** when making Convex schema changes
2. **Test both projects** after schema changes
3. **Use version control** - commit schema changes together
4. **Document new tables** in this guide

## 🚨 Important Notes

- Both projects share the **same Convex database instance**
- Deploying one project updates the schema for both
- Missing tables in either schema will cause errors in the other project
- All fields should be `v.optional()` where possible for backwards compatibility

## 📋 Table Usage by Project

| Table | readio-ios | lotus-landing |
|-------|------------|---------------|
| users | ✅ Primary | ✅ Auth/Waitlist |
| articles | ✅ Primary | ✅ Display |
| playlists | ✅ Primary | ❌ Not used |
| favorites | ✅ Primary | ❌ Not used |
| upvotes | ✅ Primary | ❌ Not used |
| liner_notes | ✅ Primary | ❌ Not used |
| audiobooks | ✅ Primary | ❌ Not used |
| meditations | ✅ Primary | ❌ Not used |
| fithop | ✅ Primary | ❌ Not used |
| content_analytics | ✅ Primary | ❌ Not used |
| env_variables | ✅ Used | ✅ Used |
| steps | ✅ Primary | ❌ Not used |
| steps_leaderboard | ✅ Primary | ❌ Not used |
| waitlist | ✅ Used | ✅ Primary |
| request_locks | ✅ Primary | ❌ Not used |
| communityPlaylists | ✅ Primary | ❌ Not used |
| content_tracking | ✅ Primary | ❌ Not used |
| user_progress | ✅ Primary | ❌ Not used |
| timer_presets | ✅ Primary | ❌ Not used |
| user_feedback_surveys | ❌ Not used | ✅ Primary |

## 🔍 Verification Commands

```bash
# Verify schemas are identical
cd /Users/itwelaibomu/Documents/Projects/Lotus
diff readio-ios/convex/schema.ts lotus-landing/convex/schema.ts

# List Convex files in both projects
ls -la readio-ios/convex/*.ts
ls -la lotus-landing/convex/*.ts

# Check for linting errors
cd readio-ios && npx convex dev --once
cd lotus-landing && npx convex dev --once
```

## 🎉 Result

Both projects can now be deployed independently without breaking each other. The shared Convex database contains all tables needed by both applications.

