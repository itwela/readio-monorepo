import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all content analytics
export const getContentAnalytics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("content_analytics").collect();
  },
});

// Get analytics by content type
export const getAnalyticsByContentType = query({
  args: { contentType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_analytics")
      .withIndex("by_contentType", (q) => q.eq("contentType", args.contentType))
      .collect();
  },
});

// Get analytics by content ID
export const getAnalyticsByContentId = query({
  args: { content_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_analytics")
      .withIndex("by_content_id", (q) => q.eq("content_id", args.content_id))
      .first();
  },
});

// Get analytics by item URL
export const getAnalyticsByItemUrl = query({
  args: { item_url: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_analytics")
      .withIndex("by_item_url", (q) => q.eq("item_url", args.item_url))
      .first();
  },
});

// Record play event (upsert)
export const recordPlayEvent = mutation({
  args: {
    contentType: v.string(),
    content_id: v.optional(v.string()),
    item_url: v.optional(v.string()),
    event_type: v.union(v.literal("play"), v.literal("complete"), v.literal("skip")),
  },
  handler: async (ctx, args) => {
    // Try to find existing record (check both old and new field names)
    const existing = await ctx.db
      .query("content_analytics")
      .withIndex("by_contentType_id_url", (q) => 
        q.eq("contentType", args.contentType)
         .eq("content_id", args.content_id ?? undefined)
         .eq("item_url", args.item_url ?? undefined)
      )
      .first();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing record
      const updateData: any = {
        last_played_at: now,
        // Ensure we have the new field name
        contentType: args.contentType,
      };

      switch (args.event_type) {
        case "play":
          updateData.plays = (existing.plays || 0) + 1;
          break;
        case "complete":
          updateData.completes = (existing.completes || 0) + 1;
          break;
        case "skip":
          updateData.skips = (existing.skips || 0) + 1;
          break;
      }

      return await ctx.db.patch(existing._id, updateData);
    } else {
      // Create new record with proper field name
      const newRecord: any = {
        contentType: args.contentType, // Use new field name
        content_id: args.content_id,
        item_url: args.item_url,
        plays: 0,
        completes: 0,
        skips: 0,
        last_played_at: now,
        created_at: now,
      };

      switch (args.event_type) {
        case "play":
          newRecord.plays = 1;
          break;
        case "complete":
          newRecord.completes = 1;
          break;
        case "skip":
          newRecord.skips = 1;
          break;
      }

      return await ctx.db.insert("content_analytics", newRecord);
    }
  },
});

// Get top played content
export const getTopPlayedContent = query({
  args: {
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let analytics;
    if (args.contentType) {
      analytics = await ctx.db
        .query("content_analytics")
        .withIndex("by_contentType", (q) => q.eq("contentType", args.contentType!))
        .collect();
    } else {
      analytics = await ctx.db.query("content_analytics").collect();
    }

    // Sort by plays and take top N
    return analytics
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, limit);
  },
});

// Get completion rates
export const getCompletionRates = query({
  args: {
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let analytics;
    if (args.contentType) {
      analytics = await ctx.db
        .query("content_analytics")
        .withIndex("by_contentType", (q) => q.eq("contentType", args.contentType!))
        .collect();
    } else {
      analytics = await ctx.db.query("content_analytics").collect();
    }

    return analytics.map(item => ({
      ...item,
      completion_rate: item.plays ? (item.completes || 0) / item.plays : 0,
      skip_rate: item.plays ? (item.skips || 0) / item.plays : 0,
    }));
  },
}); 