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

// Record tracking tokens (upsert) - play and complete only
export const recordTrackingToken = mutation({
  args: {
    contentType: v.string(),
    content_id: v.optional(v.string()),
    item_url: v.optional(v.string()),
    token_type: v.union(v.literal("play_token"), v.literal("complete")),
  },
  handler: async (ctx, args) => {
    // Try to find existing record
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
      // Update existing record - use safer property access
      const updateData: any = {
        last_played_at: now,
        contentType: args.contentType,
      };

      switch (args.token_type) {
        case "play_token":
          updateData.play_tokens = ((existing as any).play_tokens || 0) + 1;
          break;
        case "complete":
          updateData.complete_tokens = ((existing as any).complete_tokens || 0) + 1;
          break;
      }

      return await ctx.db.patch(existing._id, updateData);
    } else {
      // Create new record
      const newRecord: any = {
        contentType: args.contentType,
        content_id: args.content_id,
        item_url: args.item_url,
        play_tokens: 0,
        complete_tokens: 0,
        last_played_at: now,
        created_at: now,
      };

      switch (args.token_type) {
        case "play_token":
          newRecord.play_tokens = 1;
          break;
        case "complete":
          newRecord.complete_tokens = 1;
          break;
      }

      return await ctx.db.insert("content_analytics", newRecord);
    }
  },
});

// Get top played content (2 tokens = 1 play)
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

    // Calculate actual plays (2 tokens = 1 play) and sort
    return analytics
      .map(item => ({
        ...item,
        actual_plays: Math.floor(((item as any).play_tokens || 0) / 2),
      }))
      .sort((a, b) => b.actual_plays - a.actual_plays)
      .slice(0, limit);
  },
});

// Get completion rates (2 tokens = 1 play)
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

    return analytics.map(item => {
      const actualPlays = Math.floor(((item as any).play_tokens || 0) / 2);
      
      return {
        ...item,
        actual_plays: actualPlays,
        completion_rate: actualPlays ? ((item as any).complete_tokens || 0) / actualPlays : 0,
      };
    });
  },
}); 