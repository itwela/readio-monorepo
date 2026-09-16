# Lotus Data Export - Web Interface

A web-based interface for exporting Lotus app usage data directly from your browser.

## 🌐 Access the Export Page

Navigate to: **`http://localhost:3000/data-export`** (development)

Or: **`https://your-domain.com/data-export`** (production)

## 🚀 How to Use

1. **Navigate to the Export Page**
   - Open your browser and go to `/data-export`
   - You'll see a clean interface with export options

2. **Optional: Set Date Range**
   - Use the "Start Date" and "End Date" fields to filter data
   - Leave blank to export all historical data

3. **Click "Export All Data"**
   - The button will show "⏳ Exporting Data..." while fetching
   - Data is fetched from Convex in real-time
   - This includes:
     - Articles (with artist, text, title, timestamps)
     - Steps Leaderboard (names, step counts, user IDs)
     - Timer Presets (modes, creation dates, names)
     - Users (aggregated by name with subscription info)

4. **Download Automatically**
   - Once data is fetched, a JSON file downloads automatically
   - File name format: `lotus-usage-data-YYYY-MM-DD.json`
   - The file contains all data in a structured format

5. **Feed to AI**
   - Open the downloaded JSON file
   - Copy the contents
   - Paste into ChatGPT, Claude, or your preferred AI
   - Ask for an executive summary or analysis

## 📊 What's Included in the Export

The downloaded JSON file contains:

```json
{
  "metadata": {
    "export_timestamp": "2024-01-14T12:00:00.000Z",
    "start_date": null,
    "end_date": null,
    "source": "Lotus Landing - Web Export"
  },
  "summary": {
    "total_articles": 320,
    "total_leaderboard_entries": 150,
    "total_timer_presets": 87,
    "total_unique_users": 150,
    "paid_users": 45
  },
  "articles": [...],
  "steps_leaderboard": [...],
  "timer_presets": [...],
  "users_aggregated": [...]
}
```

## 🔐 Security Notes

- **This page exports sensitive user data**
- Ensure only authorized personnel have access to this URL
- Consider adding authentication/authorization
- Delete downloaded files after use
- Do not share the JSON files publicly

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Next.js 15 with React 19
- **Data Source**: Convex (real-time database)
- **Export Format**: JSON (pretty-printed with 2-space indentation)
- **Client-Side Processing**: All data aggregation happens in the browser

### How It Works
1. User clicks "Export All Data" button
2. React hooks (`useQuery`) fetch data from Convex
3. Data is aggregated client-side
4. A Blob is created with the JSON data
5. Download is triggered automatically via a temporary anchor element
6. File saves to user's default downloads folder

### Customization Options

You can modify the export behavior in `/app/data-export/page.tsx`:

- **File Format**: Change from JSON to CSV or TXT
- **File Name**: Modify the download filename template
- **Data Filters**: Add more filtering options (user types, content types, etc.)
- **Export Sections**: Choose which data sources to include
- **Styling**: Customize the UI colors and layout

## 🐛 Troubleshooting

### "Data not loading"
- Ensure Convex is deployed and running
- Check browser console for errors
- Verify Convex URL in `dbprovider.tsx` is correct

### "Empty data in export"
- Check if data exists in your database
- Verify date range filters aren't too restrictive
- Ensure export functions are properly deployed to Convex

### "Download not starting"
- Check browser's download settings
- Ensure pop-ups/downloads aren't blocked
- Try a different browser

### "Large file taking too long"
- For large datasets, consider using the Node.js script instead
- See `readio-ios/scripts/exportUsageData.js`
- Or add pagination to the web interface

## 🔄 Alternative Export Methods

If the web interface doesn't meet your needs:

1. **Node.js Script** (recommended for large datasets)
   ```bash
   cd readio-ios
   node scripts/exportUsageData.js
   ```

2. **Convex CLI**
   ```bash
   npx convex run dataExports:exportComprehensiveUsageData
   ```

3. **Convex Dashboard**
   - Go to dashboard.convex.dev
   - Navigate to Functions
   - Run export functions manually

## 📝 Example AI Prompt

After downloading the data, use this prompt template:

```
I'm sharing usage data from the Lotus app (an AI-powered wellness and content 
platform). Please analyze this data and provide:

1. Executive Summary (3-5 key highlights)
2. User Growth Trends
3. Feature Adoption Analysis
4. Subscription Conversion Insights
5. Content Creation Patterns
6. Recommendations for improvement

Data context:
- subscription_plan "blank" = free users
- subscription_plan "starter" = Bloom tier (paid)
- subscription_plan "premium" = Blossom tier (paid)

[PASTE JSON HERE]
```

## 🚧 Future Enhancements

Potential improvements to consider:

- [ ] Add authentication (password protect the page)
- [ ] Add export scheduling (daily/weekly automated exports)
- [ ] Add data visualization (charts before exporting)
- [ ] Add CSV export option
- [ ] Add email delivery of exports
- [ ] Add export history/archive
- [ ] Add selective export (choose which tables to include)
- [ ] Add real-time preview of data

## 📞 Support

If you encounter issues:
1. Check the Convex dashboard for function errors
2. Review browser console for client-side errors
3. Verify all export functions are deployed
4. Check network tab for failed API calls

## 🎉 Success!

Once you successfully export data, you're ready to:
✅ Generate AI summaries for stakeholders
✅ Analyze user behavior patterns
✅ Track app growth and engagement
✅ Make data-driven decisions

Happy exporting! 📊

