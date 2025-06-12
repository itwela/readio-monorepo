import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all stations
export const getCommunityPlaylists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("communityPlaylists")
      .order("desc")
      .collect();
  },
});

// Get community playlist by ID
export const getCommunityPlaylistById = query({
  args: { communityPlaylistId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityPlaylists")
      .withIndex("by_created_at")
      .first();
  },
});

// Get community playlist by name
export const getCommunityPlaylistByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityPlaylists")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create new community playlist
export const createCommunityPlaylist = mutation({
  args: {
    id: v.number(),
    name: v.string(),
    imageurl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("communityPlaylists", {
      ...args,
      created_at: now,
    });
  },
});

// Update community playlist
export const updateCommunityPlaylist = mutation({
  args: {
    id: v.number(),
    name: v.optional(v.string()),
    imageurl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const communityPlaylist = await ctx.db
    .query("communityPlaylists")
    .withIndex("by_created_at")
    .first();
    
    if (!communityPlaylist) throw new Error("Community playlist not found");

    return await ctx.db.patch(communityPlaylist._id, {
      name: args.name || communityPlaylist.name,
      imageurl: args.imageurl || communityPlaylist.imageurl,
    });
  },
});

// Delete community playlist
export const deleteCommunityPlaylist = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const communityPlaylist = await ctx.db
      .query("communityPlaylists")
      .withIndex("by_created_at")
      .first();
    
    if (!communityPlaylist) throw new Error("Community playlist not found");

    return await ctx.db.delete(communityPlaylist._id);
  },
});

// Bulk import community playlists (for initial data loading)
export const bulkImportCommunityPlaylists = mutation({
  args: {
    communityPlaylists: v.array(v.object({
      id: v.number(),
      name: v.string(),
      imageurl: v.optional(v.string()),
      created_at: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const communityPlaylist of args.communityPlaylists) {
      const id = await ctx.db.insert("communityPlaylists", communityPlaylist);
      results.push(id);
    }
    return results;
  },
});
