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

// 🎯 BANDWIDTH OPTIMIZED: Get fithop albums with article IDs (paginated and optimized)
export const getFithopAlbumsWithArticleIdsPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10; // Default to 10 albums
    
    let query = ctx.db.query("fithop").order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const albums = await query.take(limit);
    
    // Batch query for articles instead of individual queries
    const allUrls: string[] = [];
    albums.forEach(album => {
      if (album.album_songs && Array.isArray(album.album_songs)) {
        album.album_songs.forEach((track: any) => {
          if (track.url) {
            allUrls.push(track.url);
          }
        });
      }
    });
    
    if (allUrls.length === 0) {
      return {
        albums,
        nextCursor: albums.length === limit ? albums[albums.length - 1]._creationTime.toString() : null,
        hasMore: albums.length === limit
      };
    }
    
    // Single query to get all matching articles
    const allArticles = await ctx.db
      .query("articles")
      .filter((q) => q.or(...allUrls.map(url => q.eq(q.field("url"), url))))
      .collect();
    
    // Create URL to article ID map for fast lookup
    const urlToArticleMap = new Map(
      allArticles.map(article => [article.url, article._id])
    );
    
    const albumsWithArticleIds = albums.map(album => {
      if (album.album_songs && Array.isArray(album.album_songs)) {
        const tracksWithArticleIds = album.album_songs.map((track: any, index: number) => ({
          ...track,
          _id: urlToArticleMap.get(track.url) || `${album._id}-track-${index}`,
          album_id: album._id,
          contentType: 'music'
        }));
        
        return {
          ...album,
          album_songs: tracksWithArticleIds
        };
      }
      return album;
    });
    
    const nextCursor = albums.length === limit 
      ? albums[albums.length - 1]._creationTime.toString()
      : null;
    
    return {
      albums: albumsWithArticleIds,
      nextCursor,
      hasMore: albums.length === limit
    };
  },
});

// 🎯 BANDWIDTH OPTIMIZED: Get fithop albums (lightweight metadata only)
export const getFithopAlbumsLight = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const albums = await ctx.db
      .query("fithop")
      .order("desc")
      .take(limit);
    
    // Return only essential metadata
    return albums.map(album => ({
      _id: album._id,
      album_name: album.album_name,
      album_image: album.album_image,
      album_description: album.album_description,
      track_count: album.album_songs?.length || 0,
      created_at: album.created_at
    }));
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