import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all upvotes
export const getUpvotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("upvotes").collect();
  },
});

// Get upvotes by user
export const getUpvotesByUser = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upvotes")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .collect();
  },
});

// Get upvotes by article
export const getUpvotesByArticle = query({
  args: { article_id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upvotes")
      .withIndex("by_article_id", (q) => q.eq("article_id", args.article_id))
      .collect();
  },
});

// Check if user has upvoted an article
export const checkUserUpvote = query({
  args: { 
    article_id: v.id("articles"),
    user_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upvotes")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
  },
});

// Add upvote
export const addUpvote = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already upvoted
    const existing = await ctx.db
      .query("upvotes")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (existing) {
      throw new Error("Already upvoted");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("upvotes", {
      ...args,
      created_at: now,
    });
  },
});

// Remove upvote
export const removeUpvote = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const upvote = await ctx.db
      .query("upvotes")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (!upvote) {
      throw new Error("Upvote not found");
    }

    return await ctx.db.delete(upvote._id);
  },
});

// Toggle upvote (add if not exists, remove if exists)
export const toggleUpvote = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("upvotes")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (existing) {
      // Remove upvote
      await ctx.db.delete(existing._id);
      return { action: "removed", upvoted: false };
    } else {
      // Add upvote
      const now = new Date().toISOString();
      await ctx.db.insert("upvotes", {
        ...args,
        created_at: now,
      });
      return { action: "added", upvoted: true };
    }
  },
}); 