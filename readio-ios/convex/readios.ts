import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all readios/articles
export const getReadios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
  },
});

// Get readios by user
export const getReadiosByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
  },
});

// Get readios by topic
export const getReadiosByTopic = query({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_topic", (q) => q.eq("topic", args.topic))
      .collect();
  },
});

// Get featured readios
export const getFeaturedReadios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

// Get safe (non-NSFW) readios
export const getSafeReadios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_nsfw", (q) => q.eq("nsfw", false))
      .order("desc")
      .collect();
  },
});

// Get NSFW readios
export const getNSFWReadios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_nsfw", (q) => q.eq("nsfw", true))
      .collect();
  },
});

// Get readio by ID
export const getReadioById = query({
  args: { readioId: v.id("readios") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.readioId);
  },
});

// Get user's favorite readios
export const getUserFavoriteReadios = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readios")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("favorited"), true))
      .collect();
  },
});

// Get readios by multiple topics (for community playlists)
export const getReadiosByTopics = query({
  args: { topics: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.topics.map(topic =>
        ctx.db
          .query("readios")
          .withIndex("by_topic", (q) => q.eq("topic", topic))
          .filter((q) => q.eq(q.field("nsfw"), false))
          .collect()
      )
    );
    
    return args.topics.map((topic, index) => ({
      category: topic,
      articles: results[index]
    }));
  },
});

// Create new readio/article
export const createReadio = mutation({
  args: {
    title: v.string(),
    text: v.optional(v.string()),
    artwork: v.optional(v.string()),
    url: v.optional(v.string()),
    topic: v.optional(v.string()),
    artist: v.optional(v.string()),
    tag: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    username: v.optional(v.string()),
    upvotes: v.optional(v.number()),
    favorited: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    nsfw: v.optional(v.boolean()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("readios", {
      ...args,
      upvotes: args.upvotes || 0,
      favorited: args.favorited || false,
      featured: args.featured || false,
      nsfw: args.nsfw || false,
      tag: args.tag || 'default',
      created_at: now,
      updated_at: now,
    });
  },
});

// Update readio URL (after S3 upload)
export const updateReadioUrl = mutation({
  args: {
    readioId: v.id("readios"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.readioId, {
      url: args.url,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update readio artwork (after S3 upload)
export const updateReadioArtwork = mutation({
  args: {
    readioId: v.id("readios"),
    artwork: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.readioId, {
      artwork: args.artwork,
      updated_at: new Date().toISOString(),
    });
  },
});

// Toggle readio favorite status
export const toggleReadioFavorite = mutation({
  args: {
    readioId: v.id("readios"),
    favorited: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.readioId, {
      favorited: args.favorited,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update readio upvotes
export const updateReadioUpvotes = mutation({
  args: {
    readioId: v.id("readios"),
    increment: v.boolean(), // true to increment, false to decrement
  },
  handler: async (ctx, args) => {
    const readio = await ctx.db.get(args.readioId);
    if (!readio) throw new Error("Readio not found");

    const newUpvotes = args.increment 
      ? (readio.upvotes || 0) + 1 
      : Math.max((readio.upvotes || 0) - 1, 0);

    return await ctx.db.patch(args.readioId, {
      upvotes: newUpvotes,
      updated_at: new Date().toISOString(),
    });
  },
});

// Delete readio
export const deleteReadio = mutation({
  args: {
    readioId: v.id("readios"),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const readio = await ctx.db.get(args.readioId);
    if (!readio) throw new Error("Readio not found");
    
    // Verify ownership
    if (readio.user_db_id !== args.user_db_id) {
      throw new Error("Unauthorized: You can only delete your own readios");
    }

    return await ctx.db.delete(args.readioId);
  },
});

// Set readio as featured
export const setReadioFeatured = mutation({
  args: {
    readioId: v.id("readios"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.readioId, {
      featured: args.featured,
      updated_at: new Date().toISOString(),
    });
  },
});

// Get readios with pagination
export const getReadiosPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let query = ctx.db
      .query("readios")
      .withIndex("by_created_at")
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("created_at"), args.cursor!));
    }
    
    return await query.take(limit);
  },
});

// Search readios by title or content
export const searchReadios = query({
  args: { 
    searchTerm: v.string(),
    user_db_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let readios;
    
    if (args.user_db_id) {
      readios = await ctx.db
        .query("readios")
        .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id!))
        .collect();
    } else {
      readios = await ctx.db.query("readios").collect();
    }
    
    // Filter by search term (case-insensitive)
    const searchLower = args.searchTerm.toLowerCase();
    return readios.filter(readio => 
      readio.title?.toLowerCase().includes(searchLower) ||
      readio.text?.toLowerCase().includes(searchLower)
    );
  },
});

// Get readio titles for duplicate checking
export const getReadioTitlesByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    const readios = await ctx.db
      .query("readios")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
    
    return readios.map(readio => readio.title);
  },
}); 