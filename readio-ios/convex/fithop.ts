import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all fithop albums
export const getFithopAlbums = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fithop").collect();
  },
});

// Get fithop album by name
export const getFithopAlbumByName = query({
  args: { album_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fithop")
      .withIndex("by_album_name", (q) => q.eq("album_name", args.album_name))
      .first();
  },
});

// Get fithop album by ID
export const getFithopAlbumById = query({
  args: { albumId: v.id("fithop") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.albumId);
  },
});

// Create new fithop album
export const createFithopAlbum = mutation({
  args: {
    album_name: v.optional(v.string()),
    album_image: v.optional(v.string()),
    album_songs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("fithop", {
      ...args,
      created_at: now,
    });
  },
});

// Update fithop album
export const updateFithopAlbum = mutation({
  args: {
    albumId: v.id("fithop"),
    album_name: v.optional(v.string()),
    album_image: v.optional(v.string()),
    album_songs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    
    if (args.album_name) updateData.album_name = args.album_name;
    if (args.album_image) updateData.album_image = args.album_image;
    if (args.album_songs) updateData.album_songs = args.album_songs;
    
    return await ctx.db.patch(args.albumId, updateData);
  },
});

// Delete fithop album
export const deleteFithopAlbum = mutation({
  args: {
    albumId: v.id("fithop"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.albumId);
  },
});

// Search fithop albums
export const searchFithopAlbums = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const albums = await ctx.db.query("fithop").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return albums.filter(album => 
      album.album_name?.toLowerCase().includes(searchLower)
    );
  },
}); 