import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all audiobooks
export const getAudiobooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("audiobooks").collect();
  },
});

// Get audiobook by name
export const getAudiobookByName = query({
  args: { audiobook_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audiobooks")
      .withIndex("by_audiobook_name", (q) => q.eq("audiobook_name", args.audiobook_name))
      .first();
  },
});

// Get audiobooks by author
export const getAudiobooksByAuthor = query({
  args: { author: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audiobooks")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .collect();
  },
});

// Get audiobook by ID
export const getAudiobookById = query({
  args: { audiobookId: v.id("audiobooks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.audiobookId);
  },
});

// Create new audiobook
export const createAudiobook = mutation({
  args: {
    audiobook_name: v.string(),
    author: v.string(),
    duration: v.optional(v.number()),
    audio_url: v.optional(v.string()),
    audiobook_image: v.optional(v.string()),
    audiobook_description: v.optional(v.string()),
    chapters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("audiobooks", {
      ...args,
      created_at: now,
    });
  },
});

// Update audiobook
export const updateAudiobook = mutation({
  args: {
    audiobookId: v.id("audiobooks"),
    audiobook_name: v.optional(v.string()),
    author: v.optional(v.string()),
    duration: v.optional(v.number()),
    audio_url: v.optional(v.string()),
    audiobook_image: v.optional(v.string()),
    audiobook_description: v.optional(v.string()),
    chapters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    
    if (args.audiobook_name) updateData.audiobook_name = args.audiobook_name;
    if (args.author) updateData.author = args.author;
    if (args.duration !== undefined) updateData.duration = args.duration;
    if (args.audio_url) updateData.audio_url = args.audio_url;
    if (args.audiobook_image) updateData.audiobook_image = args.audiobook_image;
    if (args.audiobook_description) updateData.audiobook_description = args.audiobook_description;
    if (args.chapters) updateData.chapters = args.chapters;
    
    return await ctx.db.patch(args.audiobookId, updateData);
  },
});

// Delete audiobook
export const deleteAudiobook = mutation({
  args: {
    audiobookId: v.id("audiobooks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.audiobookId);
  },
});

// Search audiobooks
export const searchAudiobooks = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const audiobooks = await ctx.db.query("audiobooks").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return audiobooks.filter(audiobook => 
      audiobook.audiobook_name?.toLowerCase().includes(searchLower) ||
      audiobook.author?.toLowerCase().includes(searchLower) ||
      audiobook.audiobook_description?.toLowerCase().includes(searchLower)
    );
  },
}); 