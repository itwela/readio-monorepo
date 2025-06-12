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
      .filter((q) => q.neq(q.field("name"), "Bookmarked")) // Exclude the playlist named "Bookmarked"
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

// 🎯 AUTO-BOOKMARKED PLAYLIST MAGIC
// Special playlist name for auto-managing bookmarked articles
const CONTINUE_READING_PLAYLIST_NAME = "Bookmarked";

// Get or create the Continue Reading playlist for a user
export const getOrCreateContinueReadingPlaylist = mutation({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    // Try to find existing Continue Reading playlist
    const existingPlaylist = await ctx.db
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("name"), CONTINUE_READING_PLAYLIST_NAME))
      .first();

    if (existingPlaylist) {
      return existingPlaylist;
    }

    // Create new Continue Reading playlist
    const now = new Date().toISOString();
    return await ctx.db.insert("playlists", {
      name: CONTINUE_READING_PLAYLIST_NAME,
      user_db_id: args.user_db_id,
      articles: [],
      created_at: now,
      updated_at: now,
    });
  },
});

// Auto-add article to Continue Reading when progress is saved
export const autoAddToBookmarkedPlaylist = mutation({
  args: {
    user_db_id: v.string(),
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    try {
      // Find or create the Continue Reading playlist directly
      let playlist = await ctx.db
        .query("playlists")
        .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
        .filter((q) => q.eq(q.field("name"), CONTINUE_READING_PLAYLIST_NAME))
        .first();

      if (!playlist) {
        // Create new Continue Reading playlist
        const now = new Date().toISOString();
        const playlistId = await ctx.db.insert("playlists", {
          name: CONTINUE_READING_PLAYLIST_NAME,
          user_db_id: args.user_db_id,
          articles: [],
          created_at: now,
          updated_at: now,
        });
        playlist = await ctx.db.get(playlistId);
      }

      if (!playlist) {
        throw new Error("Failed to create Continue Reading playlist");
      }

      // Check if article is already in the playlist
      const isAlreadyInPlaylist = (playlist.articles || []).includes(args.articleId);
      
      if (!isAlreadyInPlaylist) {
        // Add article to the beginning of the playlist (most recent first)
        const updatedArticles = [args.articleId, ...(playlist.articles || [])];
        
        await ctx.db.patch(playlist._id, {
          articles: updatedArticles,
          updated_at: new Date().toISOString()
        });

        console.log(`📚 Auto-added article ${args.articleId} to Continue Reading playlist`);
      }

      return { success: true, playlistId: playlist._id };
    } catch (error) {
      console.error("Error auto-adding to bookmarked playlist:", error);
      return { success: false, error: (error as Error).message };
    }
  },
});

// Auto-remove article from Continue Reading when progress is cleared
export const autoRemoveFromBookmarkedPlaylist = mutation({
  args: {
    user_db_id: v.string(),
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    try {
      // Find the Continue Reading playlist
      const playlist = await ctx.db
        .query("playlists")
        .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
        .filter((q) => q.eq(q.field("name"), CONTINUE_READING_PLAYLIST_NAME))
        .first();

      if (!playlist) {
        return { success: true, message: "No Continue Reading playlist found" };
      }

      // Remove article from the playlist
      const updatedArticles = (playlist.articles || []).filter(id => id !== args.articleId);
      
      await ctx.db.patch(playlist._id, {
        articles: updatedArticles,
        updated_at: new Date().toISOString()
      });

      console.log(`📚 Auto-removed article ${args.articleId} from Continue Reading playlist`);
      return { success: true, playlistId: playlist._id };
    } catch (error) {
      console.error("Error auto-removing from bookmarked playlist:", error);
      return { success: false, error: (error as Error).message };
    }
  },
});

// Get Continue Reading playlist with articles (query for reactive use)
export const getContinueReadingPlaylist = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    // Find the Continue Reading playlist
    const playlist = await ctx.db
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("name"), CONTINUE_READING_PLAYLIST_NAME))
      .first();

    if (!playlist) {
      return null;
    }

    // Get all articles in the playlist
    const articles = await Promise.all(
      (playlist.articles || []).map(async (articleId) => {
        return await ctx.db.get(articleId);
      })
    );

    // Filter out any null articles (in case some were deleted)
    const validArticles = articles.filter(Boolean);

    return {
      ...playlist,
      articles: validArticles,
      articleCount: validArticles.length
    };
  },
});

// Get Continue Reading playlist articles with progress info
export const getContinueReadingWithProgress = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    // Find the Continue Reading playlist directly
    const playlist = await ctx.db
      .query("playlists")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("name"), CONTINUE_READING_PLAYLIST_NAME))
      .first();

    if (!playlist || !playlist.articles.length) {
      return null;
    }

    // Get all articles with their data
    const articles = await Promise.all(
      playlist.articles.map(async (articleId) => {
        return await ctx.db.get(articleId);
      })
    );

    // Filter out any null articles
    const validArticles = articles.filter(Boolean);

    // Get progress for each article
    const articlesWithProgress = await Promise.all(
      validArticles.map(async (article) => {
        if (!article) return null;
        
        const progress = await ctx.db
          .query("user_progress")
          .withIndex("by_user_content", (q) => 
            q.eq("user_db_id", args.user_db_id)
             .eq("contentType", "article")
             .eq("content_id", article._id)
          )
          .first();

        return {
          ...article,
          progress: progress ? {
            position_seconds: progress.position_seconds,
            duration_seconds: progress.duration_seconds,
            last_updated: progress.last_updated,
            progress_percentage: progress.duration_seconds 
              ? Math.round((progress.position_seconds / progress.duration_seconds) * 100)
              : 0
          } : null
        };
      })
    );

    // Filter out any null results
    const finalArticles = articlesWithProgress.filter(Boolean);

    return {
      ...playlist,
      articles: finalArticles,
      articleCount: finalArticles.length
    };
  },
});
