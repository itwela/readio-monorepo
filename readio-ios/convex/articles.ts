import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all articles
export const getArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
  },
});

// Get articles by user
export const getArticlesByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
  },
});

// Get articles by topic
export const getArticlesByTopic = query({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_topic", (q) => q.eq("topic", args.topic))
      .collect();
  },
});

// Get featured articles
export const getFeaturedArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

// Get safe (non-NSFW) articles
export const getSafeArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_nsfw", (q) => q.eq("nsfw", false))
      .order("desc")
      .collect();
  },
});

// Get NSFW articles
export const getNSFWArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_nsfw", (q) => q.eq("nsfw", true))
      .collect();
  },
});

// Get article by ID
export const getArticleById = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.articleId);
  },
});

// Get user's favorite articles
export const getUserFavoriteArticles = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .filter((q) => q.eq(q.field("favorited"), true))
      .collect();
  },
});

// Get articles by multiple topics (for community playlists)
export const getArticlesByTopics = query({
  args: { topics: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.topics.map(topic =>
        ctx.db
          .query("articles")
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

// Get articles with pagination
export const getArticlesPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let query = ctx.db
      .query("articles")
      .withIndex("by_created_at")
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("created_at"), args.cursor!));
    }
    
    return await query.take(limit);
  },
});

// Search articles by title or content
export const searchArticles = query({
  args: { 
    searchTerm: v.string(),
    user_db_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let articles;
    
    if (args.user_db_id) {
      articles = await ctx.db
        .query("articles")
        .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id!))
        .collect();
    } else {
      articles = await ctx.db.query("articles").collect();
    }
    
    // Filter by search term (case-insensitive)
    const searchLower = args.searchTerm.toLowerCase();
    return articles.filter(article => 
      article.title?.toLowerCase().includes(searchLower) ||
      article.text?.toLowerCase().includes(searchLower)
    );
  },
});

// Get article titles for duplicate checking
export const getArticleTitlesByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
    
    return articles.map(article => article.title);
  },
}); 

export const getCommunityPlaylistArticles = query({
  args: {}, // No arguments needed as the categories are predefined within the function
  handler: async (ctx) => {

  const communityPlaylists = await ctx.db.query("communityPlaylists").collect();
  const targetCategoryNames = communityPlaylists
    .map(communityPlaylist => communityPlaylist.name)
    .filter(name => name !== 'Lotus');

  const articlesPromises = targetCategoryNames.map(async (categoryName) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_topic", (q) => q.eq("topic", categoryName))
      .filter((q) => q.eq(q.field("nsfw"), false))
      .collect();
      
    // Get the playlist with image URL
    const playlist = communityPlaylists.find(p => p.name === categoryName);
    
    return { 
      _id: playlist?._id,
      category: categoryName,
      articles,
      imageurl: playlist?.imageurl || null // Use 'imageurl' to match component expectations
    };
  });
    
  const results = await Promise.all(articlesPromises);

  return results;
  },
});

// Create new article
export const createArticle = mutation({
  args: {
    title: v.string(),
    text: v.optional(v.string()),
    artwork: v.optional(v.string()),
    url: v.optional(v.string()),
    topic: v.optional(v.string()),
    artist: v.optional(v.string()),
    tag: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    upvotes: v.optional(v.number()),
    favorited: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    nsfw: v.optional(v.boolean()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("articles", {
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

// Update article URL (after S3 upload)
export const updateArticleUrl = mutation({
  args: {
    articleId: v.id("articles"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.articleId, {
      url: args.url,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update article with both audio URL and artwork URL
export const updateArticleUrls = mutation({
  args: {
    articleId: v.id("articles"),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (args.audioUrl) updateData.url = args.audioUrl;
    if (args.imageUrl) updateData.artwork = args.imageUrl;

    return await ctx.db.patch(args.articleId, updateData);
  },
});

// Toggle article favorite status
export const toggleArticleFavorite = mutation({
  args: {
    articleId: v.id("articles"),
    favorited: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.articleId, {
      favorited: args.favorited,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update article upvotes
export const updateArticleUpvotes = mutation({
  args: {
    articleId: v.id("articles"),
    increment: v.boolean(), // true to increment, false to decrement
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");

    const newUpvotes = args.increment 
      ? (article.upvotes || 0) + 1 
      : Math.max((article.upvotes || 0) - 1, 0);

    return await ctx.db.patch(args.articleId, {
      upvotes: newUpvotes,
      updated_at: new Date().toISOString(),
    });
  },
});

// Delete article
export const deleteArticle = mutation({
  args: {
    articleId: v.id("articles"),
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    
    // Verify ownership
    if (article.user_db_id !== args.user_db_id) {
      throw new Error("Unauthorized: You can only delete your own articles");
    }

    return await ctx.db.delete(args.articleId);
  },
});

// Set article as featured
export const setArticleFeatured = mutation({
  args: {
    articleId: v.id("articles"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.articleId, {
      featured: args.featured,
      updated_at: new Date().toISOString(),
    });
  },
});
