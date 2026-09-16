# Quick Fix for Data Export Page Error

## The Problem
The error `Cannot read properties of undefined (reading 'Symbol(functionName)')` occurs because the Convex dev server needs to reload the new `dataExports.ts` functions.

## The Solution

### Option 1: Restart Convex Dev Server (Recommended)

1. **Stop the current Convex dev server** (if running)
   - Press `Ctrl+C` in the terminal running Convex

2. **Restart it:**
   ```bash
   cd lotus-landing
   npx convex dev
   ```

3. **Wait for it to sync** - You should see:
   ```
   ✓ Deployment complete
   ✓ Functions synced
   ```

4. **Restart Next.js dev server** (in a separate terminal):
   ```bash
   cd lotus-landing
   npm run dev
   ```

5. **Visit the page again:**
   ```
   http://localhost:3000/data-export
   ```

### Option 2: Deploy to Production

If you want to use the deployed Convex (not local dev):

```bash
cd lotus-landing
npx convex deploy
```

Then restart the Next.js server.

## Verification

After restarting, you should see the data export page load without errors. The page will show:
- 📊 Lotus Usage Data Export header
- Date range inputs
- Purple "Export All Data" button

## Still Having Issues?

### Check if dataExports is loaded:

1. Open browser console on the `/data-export` page
2. Type: `console.log(api)`
3. Look for `dataExports` in the output
4. It should show your 5 export functions

### If dataExports is still missing:

1. Verify `convex/dataExports.ts` exists in `lotus-landing/`
2. Check for TypeScript errors in the file
3. Ensure Convex dev server is running without errors
4. Check the Convex dashboard to see if functions are deployed

## Expected Convex Output

When you run `npx convex dev`, you should see:

```
✓ Loaded dataExports.ts
✓ Function: dataExports:exportArticles
✓ Function: dataExports:exportStepsLeaderboard
✓ Function: dataExports:exportTimerPresets
✓ Function: dataExports:exportUsersAggregated
✓ Function: dataExports:exportComprehensiveUsageData
```

## Next Steps After Fix

Once the page loads:
1. Click "Export All Data"
2. Wait for data to fetch (may take a few seconds)
3. JSON file will download automatically
4. Use the file for AI analysis

That's it! 🎉

