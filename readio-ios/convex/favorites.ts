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

// Get favorites by readio
export const getFavoritesByReadio = query({
  args: { readio_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_readio_id", (q) => q.eq("readio_id", args.readio_id))
      .collect();
  },
});

// Check if user has favorited a readio
export const checkUserFavorite = query({
  args: { 
    readio_id: v.number(),
    user_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_readio_user", (q) => 
        q.eq("readio_id", args.readio_id).eq("user_id", args.user_id)
      )
      .first();
  },
});

// Add favorite
export const addFavorite = mutation({
  args: {
    readio_id: v.number(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_readio_user", (q) => 
        q.eq("readio_id", args.readio_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (existing) {
      throw new Error("Already favorited");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("favorites", {
      ...args,
      created_at: now,
    });
  },
});

// Remove favorite
export const removeFavorite = mutation({
  args: {
    readio_id: v.number(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_readio_user", (q) => 
        q.eq("readio_id", args.readio_id).eq("user_id", args.user_id)
      )
      .first();
    
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    return await ctx.db.delete(favorite._id);
  },
});

// Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = mutation({
  args: {
    readio_id: v.number(),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_readio_user", (q) => 
        q.eq("readio_id", args.readio_id).eq("user_id", args.user_id)
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