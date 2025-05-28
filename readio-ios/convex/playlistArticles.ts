import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all playlist-article relationships
export const getPlaylistArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("playlist_articles").collect();
  },
});

// Get articles in a playlist
export const getArticlesByPlaylist = query({
  args: { playlist_id: v.id("playlists") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .collect();
  },
});

// Get playlists containing an article
export const getPlaylistsByArticle = query({
  args: { article_id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlist_articles")
      .withIndex("by_article_id", (q) => q.eq("article_id", args.article_id))
      .collect();
  },
});

// Get playlist-article relationships by user
export const getPlaylistArticlesByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlist_articles")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
  },
});

// Add article to playlist
export const addArticleToPlaylist = mutation({
  args: {
    playlist_id: v.id("playlists"),
    article_id: v.id("articles"),
    playlist: v.optional(v.string()),
    article: v.optional(v.string()),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if article is already in playlist
    const existing = await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .filter((q) => q.eq(q.field("article_id"), args.article_id))
      .first();
    
    if (existing) {
      throw new Error("Article already in playlist");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("playlist_articles", {
      ...args,
      created_at: now,
    });
  },
});

// Remove article from playlist
export const removeArticleFromPlaylist = mutation({
  args: {
    playlist_id: v.id("playlists"),
    article_id: v.id("articles"),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const playlistArticle = await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .filter((q) => 
        q.eq(q.field("article_id"), args.article_id) &&
        q.eq(q.field("user_db_id"), args.user_db_id)
      )
      .first();
    
    if (!playlistArticle) {
      throw new Error("Article not found in playlist");
    }

    return await ctx.db.delete(playlistArticle._id);
  },
});

// Remove all articles from playlist
export const removeAllArticlesFromPlaylist = mutation({
  args: {
    playlist_id: v.id("playlists"),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const playlistArticles = await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .filter((q) => q.eq(q.field("user_db_id"), args.user_db_id))
      .collect();
    
    const deletePromises = playlistArticles.map(pa => ctx.db.delete(pa._id));
    return await Promise.all(deletePromises);
  },
});

// Check if article is in playlist
export const checkArticleInPlaylist = query({
  args: {
    playlist_id: v.id("playlists"),
    article_id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .filter((q) => q.eq(q.field("article_id"), args.article_id))
      .first();
  },
});

// Get articles with full data for a playlist
export const getPlaylistWithArticles = query({
  args: { playlist_id: v.id("playlists") },
  handler: async (ctx, args) => {
    // Get playlist-article relationships
    const playlistArticles = await ctx.db
      .query("playlist_articles")
      .withIndex("by_playlist_id", (q) => q.eq("playlist_id", args.playlist_id))
      .collect();

    // Fetch the actual articles
    const articles = await Promise.all(
      playlistArticles.map(async (pa) => {
        const article = await ctx.db.get(pa.article_id);
        return article;
      })
    );

    // Filter out any null articles (in case some were deleted)
    return articles.filter(article => article !== null);
  },
}); 