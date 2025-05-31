import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// 🎯 NUCLEAR PATTERN: Save user progress (mutation)
export const saveUserProgress = mutation({
  args: {
    user_db_id: v.string(),
    contentType: v.string(), // 'audiobook', 'liner_note', 'article'
    content_id: v.string(),
    content_name: v.optional(v.string()),
    chapter_index: v.optional(v.number()),
    chapter_id: v.optional(v.string()),
    chapter_title: v.optional(v.string()),
    position_seconds: v.number(),
    duration_seconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // console.log('💾 Saving user progress:', {
    //   user: args.user_db_id,
    //   content: args.content_name,
    //   chapter: args.chapter_title,
    //   position: args.position_seconds
    // });

    // Check if progress already exists for this content
    const existingProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_user_content", (q) => 
        q.eq("user_db_id", args.user_db_id)
         .eq("contentType", args.contentType)
         .eq("content_id", args.content_id)
      )
      .first();

    if (existingProgress) {
      // Update existing progress
      return await ctx.db.patch(existingProgress._id, {
        content_name: args.content_name,
        chapter_index: args.chapter_index,
        chapter_id: args.chapter_id,
        chapter_title: args.chapter_title,
        position_seconds: args.position_seconds,
        duration_seconds: args.duration_seconds,
        last_updated: now,
      });
    } else {
      // Create new progress record
      return await ctx.db.insert("user_progress", {
        user_db_id: args.user_db_id,
        contentType: args.contentType,
        content_id: args.content_id,
        content_name: args.content_name,
        chapter_index: args.chapter_index,
        chapter_id: args.chapter_id,
        chapter_title: args.chapter_title,
        position_seconds: args.position_seconds,
        duration_seconds: args.duration_seconds,
        last_updated: now,
        created_at: now,
      });
    }
  },
});

// 🎯 NUCLEAR PATTERN: Get user progress for specific content (query - use with convex client)
export const getUserProgressForContent = query({
  args: {
    user_db_id: v.string(),
    contentType: v.string(),
    content_id: v.string(),
  },
  handler: async (ctx, args) => {
    // console.log('🔍 Getting user progress for:', {
    //   user: args.user_db_id,
    //   type: args.contentType,
    //   content: args.content_id
    // });

    return await ctx.db
      .query("user_progress")
      .withIndex("by_user_content", (q) => 
        q.eq("user_db_id", args.user_db_id)
         .eq("contentType", args.contentType)
         .eq("content_id", args.content_id)
      )
      .first();
  },
});

// 🎯 NUCLEAR PATTERN: Get all user progress (query - use with convex client)
export const getAllUserProgress = query({
  args: {
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    // console.log('📚 Getting all progress for user:', args.user_db_id);

    return await ctx.db
      .query("user_progress")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .order("desc") // Most recent first
      .collect();
  },
});

// 🎯 Get user progress by content type (query - use with convex client)
export const getUserProgressByType = query({
  args: {
    user_db_id: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_progress")
      .withIndex("by_user_contentType", (q) => 
        q.eq("user_db_id", args.user_db_id)
         .eq("contentType", args.contentType)
      )
      .order("desc")
      .collect();
  },
});

// Delete user progress for specific content
export const deleteUserProgress = mutation({
  args: {
    user_db_id: v.string(),
    contentType: v.string(),
    content_id: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("user_progress")
      .withIndex("by_user_content", (q) => 
        q.eq("user_db_id", args.user_db_id)
         .eq("contentType", args.contentType)
         .eq("content_id", args.content_id)
      )
      .first();

    if (progress) {
      await ctx.db.delete(progress._id);
      return { success: true, message: "Progress deleted" };
    }

    return { success: false, message: "Progress not found" };
  },
});

// 🎯 Batch save progress for multiple items (useful for syncing)
export const batchSaveProgress = mutation({
  args: {
    progressList: v.array(v.object({
      user_db_id: v.string(),
      contentType: v.string(),
      content_id: v.string(),
      content_name: v.optional(v.string()),
      chapter_index: v.optional(v.number()),
      chapter_id: v.optional(v.string()),
      chapter_title: v.optional(v.string()),
      position_seconds: v.number(),
      duration_seconds: v.optional(v.number()),
    }))
  },
  handler: async (ctx, args) => {
    const results = [];
    const now = new Date().toISOString();

    for (const progress of args.progressList) {
      try {
        const existingProgress = await ctx.db
          .query("user_progress")
          .withIndex("by_user_content", (q) => 
            q.eq("user_db_id", progress.user_db_id)
             .eq("contentType", progress.contentType)
             .eq("content_id", progress.content_id)
          )
          .first();

        if (existingProgress) {
          await ctx.db.patch(existingProgress._id, {
            ...progress,
            last_updated: now,
          });
          results.push({ content_id: progress.content_id, status: 'updated' });
        } else {
          await ctx.db.insert("user_progress", {
            ...progress,
            last_updated: now,
            created_at: now,
          });
          results.push({ content_id: progress.content_id, status: 'created' });
        }
      } catch (error) {
        results.push({ 
          content_id: progress.content_id, 
          status: 'error', 
          error: (error as Error).message || 'Unknown error'
        });
      }
    }

    return results;
  },
});

// Get recent activity across all content types for a user
export const getRecentActivity = query({
  args: {
    user_db_id: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    return await ctx.db
      .query("user_progress")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .order("desc")
      .take(limit);
  },
});

// Clean up old progress entries
export const cleanupOldProgress = mutation({
  args: {
    days_old: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - args.days_old);
    const cutoffString = cutoffDate.toISOString();

    const oldProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_last_updated", (q) => q.lt("last_updated", cutoffString))
      .collect();

    for (const progress of oldProgress) {
      if (progress.position_seconds < 30) { // Only delete if very little progress
        await ctx.db.delete(progress._id);
      }
    }

    return {
      deleted: oldProgress.filter(p => p.position_seconds < 30).length,
      total_old: oldProgress.length
    };
  },
}); 