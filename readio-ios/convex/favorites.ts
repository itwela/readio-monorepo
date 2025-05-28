import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all favorites
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("favorites").collect();
  },
});

// Get favorites by user
export const getFavoritesByUser = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .collect();
  },
});

// Get favorites by article
export const getFavoritesByArticle = query({
  args: { article_id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_article_id", (q) => q.eq("article_id", args.article_id))
      .collect();
  },
});

// Check if user has favorited an article
export const checkUserFavorite = query({
  args: { 
    article_id: v.id("articles"),
    user_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
  },
});

// Add article to favorites
export const addToFavorites = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (existing) {
      throw new Error("Article already favorited");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("favorites", {
      ...args,
      created_at: now,
    });
  },
});

// Remove article from favorites
export const removeFromFavorites = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (!favorite) {
      throw new Error("Article not in favorites");
    }

    return await ctx.db.delete(favorite._id);
  },
});

// Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = mutation({
  args: {
    article_id: v.id("articles"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_article_user", (q) => 
        q.eq("article_id", args.article_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (existing) {
      // Remove favorite
      await ctx.db.delete(existing._id);
      return { action: "removed", favorited: false };
    } else {
      // Add favorite
      const now = new Date().toISOString();
      await ctx.db.insert("favorites", {
        ...args,
        created_at: now,
      });
      return { action: "added", favorited: true };
    }
  },
}); 