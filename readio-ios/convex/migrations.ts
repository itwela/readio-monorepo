import { internalMutation } from "./_generated/server";

// 🎯 MIGRATION: Update content_analytics from contentType to contentType (legacy migration)
export const migrateContentAnalyticsToContentType = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Starting migration: legacy contentType cleanup');
    
    // Get all content_analytics records
    const allAnalytics = await ctx.db.query("content_analytics").collect();
    console.log(`📊 Found ${allAnalytics.length} content analytics records to check`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const record of allAnalytics) {
      try {
        // Check if record has old field name (this is now legacy since we use contentType)
        const recordData = record as any;
        
        if (recordData.contentType_legacy && !recordData.contentType) {
          console.log(`🔄 Migrating record ${record._id}: legacy field → contentType`);
          
          // Update the record with new field name
          await ctx.db.patch(record._id, {
            contentType: recordData.contentType_legacy,
          });
          
          migrated++;
        }
      } catch (error) {
        console.error(`❌ Error migrating record ${record._id}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Migration completed: ${migrated} records migrated, ${errors} errors`);
    
    return {
      totalRecords: allAnalytics.length,
      migrated,
      errors,
      success: errors === 0
    };
  },
}); 