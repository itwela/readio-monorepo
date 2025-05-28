import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all playlists
export const getPlaylists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("playlists").collect();
  },
});

// Add item to playlist
export const addToPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    articleId: v.id("articles"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.user_db_id !== args.userId) throw new Error("Unauthorized");
    
    const updatedArticles = [...(playlist.articles || []), args.articleId];
    return await ctx.db.patch(args.playlistId, {
      articles: updatedArticles,
      updated_at: new Date().toISOString()
    });
  },
});

// Remove item from playlist
export const removeFromPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    articleId: v.id("articles"), 
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) throw new Error("Playlist not found");
    if (playlist.user_db_id !== args.userId) throw new Error("Unauthorized");
    
    const updatedArticles = (playlist.articles || []).filter(id => id !== args.articleId);
    return await ctx.db.patch(args.playlistId, {
      articles: updatedArticles,
      updated_at: new Date().toISOString()
    });
  },
});

// Get playlists by user
export const getPlaylistsByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
    
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
  },
});

// Get playlist by name and user
export const getPlaylistByNameAndUser = query({
  args: { 
    name: v.string(),
    user_db_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  },
});

// Get playlist by ID
export const getPlaylistById = query({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.playlistId);
  },
});

// Create new playlist
export const createPlaylist = mutation({
  args: {
    name: v.string(),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("playlists", {
      ...args,
      articles: [],
      created_at: now,
      updated_at: now,
    });
  },
});

// Update playlist
export const updatePlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (args.name) updateData.name = args.name;
    
    return await ctx.db.patch(args.playlistId, updateData);
  },
});

// Delete playlist
export const deletePlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) throw new Error("Playlist not found");
    
    // Verify ownership
    if (playlist.user_db_id !== args.user_db_id) {
      throw new Error("Unauthorized: You can only delete your own playlists");
    }

    return await ctx.db.delete(args.playlistId);
  },
});

// Delete playlist by name and user
export const deletePlaylistByNameAndUser = mutation({
  args: {
    name: v.string(),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const playlist = await ctx.db
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    
    if (!playlist) throw new Error("Playlist not found");
    
    return await ctx.db.delete(playlist._id);
  },
});
