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
      .order("desc")
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
      .order("desc")
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
      .order("desc")
      .collect();
  },
});

// Get safe (non-NSFW) articles

// Get NSFW articles
export const getNSFWArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_nsfw", (q) => q.eq("nsfw", true))
      .order("desc")
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
      .order("desc")
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
          .order("desc")
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
      .order("desc")
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
    contentType: v.optional(v.string()),
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

export const getComprehensiveFavoritesLight = query({
  args: {
    user_db_id: v.string(),
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("articles")
      .filter((q) => q.and(
        q.eq(q.field("favorited"), true),
        q.or(
          q.eq(q.field("user_db_id"), args.user_db_id),
          q.neq(q.field("contentType"), "article")
        )
      ))
      .order("desc")
      .collect();

    // Return lightweight objects without heavy fields
    return favorites.map(article => ({
      _id: article._id,
      title: article.title,
      artist: article.artist,
      topic: article.topic,
      artwork: article.artwork,
      url: article.url,
      duration: article.duration,
      favorited: article.favorited,
      featured: article.featured,
      contentType: article.contentType,
      created_at: article.created_at,
      // Excluded fields: text, user_db_id, nsfw, upvotes
    }));
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


    // 1. Delete favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_article_id", (q) => q.eq("article_id", args.articleId))
      .collect();
    
    for (const favorite of favorites) {
      await ctx.db.delete(favorite._id);
    }

    // 3. Delete upvotes  
    const upvotes = await ctx.db
      .query("upvotes")
      .withIndex("by_article_id", (q) => q.eq("article_id", args.articleId))
      .collect();
    
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    // 5. Delete user progress/bookmarks
    const progressRecords = await ctx.db
      .query("user_progress")
      .withIndex("by_user_content", (q) => 
        q.eq("user_db_id", args.user_db_id)
         .eq("contentType", "article")
         .eq("content_id", args.articleId)
      )
      .collect();
    
    for (const progress of progressRecords) {
      await ctx.db.delete(progress._id);
    }

    // 6. Delete content analytics
    const analytics = await ctx.db
      .query("content_analytics")
      .withIndex("by_content_id", (q) => q.eq("content_id", args.articleId))
      .collect();
    
    for (const analytic of analytics) {
      await ctx.db.delete(analytic._id);
    }

    // 7. Finally, delete the article
    await ctx.db.delete(args.articleId);

    console.log(`✅ Article ${args.articleId} and all related data deleted successfully`);
    return { success: true, deletedArticleId: args.articleId };
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

// 🎯 BANDWIDTH OPTIMIZED: Get articles by user (metadata only with pagination)
export const getArticlesByUserLight = query({
  args: { 
    user_db_id: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()) // Add cursor support for pagination
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50; // Default limit
    
    let query = ctx.db
      .query("articles")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const articles = await query.take(limit);
    
    // Return only essential fields, not full text content
    const lightArticles = articles.map(article => ({
      _id: article._id,
      title: article.title,
      artist: article.artist,
      topic: article.topic,
      artwork: article.artwork,
      url: article.url,
      duration: article.duration,
      favorited: article.favorited,
      featured: article.featured,
      nsfw: article.nsfw,
      upvotes: article.upvotes,
      created_at: article.created_at,
      contentType: article.contentType,
      // Exclude heavy fields: text, user_db_id (not needed for lists)
    }));
    
    const nextCursor = articles.length === limit 
      ? articles[articles.length - 1]._creationTime.toString()
      : null;
    
    return {
      articles: lightArticles,
      nextCursor,
      hasMore: articles.length === limit
    };
  },
});

// 🎯 BANDWIDTH OPTIMIZED: Get safe articles (paginated with essential fields only)
export const getSafeArticlesLight = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20; // Much smaller default
    
    let query = ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("nsfw"), false))
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const articles = await query.take(limit);
    
    // Return only essential fields to reduce bandwidth
    const lightArticles = articles.map(article => ({
      _id: article._id,
      title: article.title,
      artist: article.artist,
      topic: article.topic,
      artwork: article.artwork,
      url: article.url,
      duration: article.duration,
      favorited: article.favorited,
      featured: article.featured,
      upvotes: article.upvotes,
      contentType: article.contentType,
      created_at: article.created_at,
      // Exclude heavy fields like 'text' content
    }));
    
    const nextCursor = articles.length === limit 
      ? articles[articles.length - 1]._creationTime.toString()
      : null;
    
    return {
      articles: lightArticles,
      nextCursor,
      hasMore: articles.length === limit
    };
  },
});

// 🎯 BANDWIDTH OPTIMIZED: Get community playlist articles (metadata only)
export const getCommunityPlaylistArticlesLight = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    // 🎯 FETCH COMMUNITY PLAYLISTS FIRST to get imageurl and _id
    const communityPlaylists = await ctx.db.query("communityPlaylists").collect();
    const targetCategoryNames = communityPlaylists
      .map(communityPlaylist => communityPlaylist.name)
      .filter(name => name !== 'Lotus');

    const results = await Promise.all(
      targetCategoryNames.map(async (categoryName) => {
        const articles = await ctx.db
          .query("articles")
          .withIndex("by_topic", (q) => q.eq("topic", categoryName))
          .filter((q) => q.eq(q.field("nsfw"), false))
          .order("desc")
          .take(Math.floor(limit / targetCategoryNames.length));
        
        // Get the playlist with image URL
        const playlist = communityPlaylists.find(p => p.name === categoryName);
        
        return {
          _id: playlist?._id,
          category: categoryName,
          imageurl: playlist?.imageurl || null, // 🎯 NOW INCLUDES imageurl from communityPlaylist table
          articles: articles.map(article => ({
            _id: article._id,
            title: article.title,
            artist: article.artist,
            topic: article.topic,
            artwork: article.artwork,
            url: article.url,
            duration: article.duration,
            favorited: article.favorited,
            featured: article.featured,
            upvotes: article.upvotes,
            created_at: article.created_at,
            contentType: article.contentType,
          }))
        };
      })
    );
    
    return results;
  },
});

// 🎯 NEW: Get articles by content type (replaces heavy table queries)
export const getArticlesByContentType = query({
  args: { 
    contentType: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), args.contentType))
      .order("desc")
      .take(limit);
  },
});

// 🎯 NEW: Get music articles (replaces fithop table query)
export const getMusicArticles = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "music"))
      .order("desc")
      .take(limit);
  },
});

// 🎯 NEW: Get audiobook articles (replaces audiobooks table query)
export const getAudiobookArticles = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "audiobook"))
      .order("desc")
      .take(limit);
  },
});

// 🎯 NEW: Get liner notes articles (replaces liner_notes table query)
export const getLinerNotesArticles = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "liner_notes"))
      .order("desc")
      .take(limit);
  },
});

// 🎯 NEW: Get music articles grouped by album/topic (for album view)
export const getMusicArticlesGroupedByAlbum = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 200; // Get more tracks to properly group into albums
    
    const musicArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "music"))
      .order("desc")
      .take(limit);
    
    // Group by topic (album name)
    const albumMap = new Map<string, any[]>();
    
    musicArticles.forEach(article => {
      const albumName = article.topic || "Unknown Album";
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, []);
      }
      albumMap.get(albumName)!.push({
        ...article,
        // Ensure track format compatibility
        title: article.title,
        url: article.url,
        artwork: article.artwork,
        artist: article.artist,
        duration: article.duration,
        contentType: article.contentType,
      });
    });
    
    // Convert to album format that matches existing structure
    const albums = Array.from(albumMap.entries()).map(([albumName, tracks]) => ({
      _id: `album_${albumName.replace(/\s+/g, '_')}`,
      album_name: albumName,
      album_image: tracks[0]?.artwork || '',
      album_songs: tracks,
      track_count: tracks.length,
      created_at: tracks[0]?.created_at,
    }));
    
    return albums;
  },
});

// 🎯 NEW: Get audiobook articles grouped by audiobook (for audiobook view)
export const getAudiobookArticlesGroupedByBook = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 200;
    
    const audiobookArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "audiobook"))
      .order("desc")
      .take(limit);
    
    // Group by topic (audiobook name)
    const audiobookMap = new Map<string, any[]>();
    
    audiobookArticles.forEach(article => {
      const audiobookName = article.topic || "Unknown Audiobook";
      if (!audiobookMap.has(audiobookName)) {
        audiobookMap.set(audiobookName, []);
      }
      audiobookMap.get(audiobookName)!.push({
        ...article,
        // Ensure chapter format compatibility
        title: article.title,
        url: article.url,
        artwork: article.artwork,
        artist: article.artist,
        duration: article.duration,
        contentType: article.contentType,
      });
    });
    
    // Convert to audiobook format
    const audiobooks = Array.from(audiobookMap.entries()).map(([audiobookName, chapters]) => ({
      _id: `audiobook_${audiobookName.replace(/\s+/g, '_')}`,
      audiobook_name: audiobookName,
      author: chapters[0]?.artist || "Unknown Author",
      audiobook_image: chapters[0]?.artwork || '',
      audiobook_description: `${chapters.length} chapters`,
      chapters: chapters,
      chapter_count: chapters.length,
      created_at: chapters[0]?.created_at,
    }));
    
    return audiobooks;
  },
});

// 🎯 NEW: Get liner notes articles grouped by season (for liner notes view)
export const getLinerNotesArticlesGroupedBySeason = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 200;
    
    const linerNotesArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "liner_notes"))
      .order("desc")
      .take(limit);
    
    // Group by topic (season name)
    const seasonMap = new Map<string, any[]>();
    
    linerNotesArticles.forEach(article => {
      const seasonName = article.topic || "Unknown Season";
      if (!seasonMap.has(seasonName)) {
        seasonMap.set(seasonName, []);
      }
      seasonMap.get(seasonName)!.push({
        ...article,
        // Ensure chapter format compatibility
        title: article.title,
        url: article.url,
        artwork: article.artwork,
        artist: article.artist,
        duration: article.duration,
        contentType: article.contentType,
      });
    });
    
    // Convert to season format
    const seasons = Array.from(seasonMap.entries()).map(([seasonName, chapters]) => ({
      _id: `season_${seasonName.replace(/\s+/g, '_')}`,
      name: seasonName,
      season_image: chapters[0]?.artwork || '',
      season_description: `${chapters.length} episodes`,
      chapters: chapters,
      chapter_count: chapters.length,
      created_at: chapters[0]?.created_at,
    }));
    
    return seasons;
  },
});

// 🎯 HYBRID: Get music with album metadata + articles tracks (best of both worlds)
export const getMusicWithAlbumMetadata = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Step 1: Get album metadata ONLY (lightweight) from fithop table
    const albumsMetadata = await ctx.db
      .query("fithop")
      .order("desc")
      .take(limit);
    
    // Step 2: Get all music tracks from articles table
    const musicArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "music"))
      .order("asc")
      .collect();
    
    // Step 3: Group articles by album name (topic)
    const tracksByAlbum = new Map<string, any[]>();
    musicArticles.forEach(article => {
      const albumName = article.topic || "Unknown Album";
      if (!tracksByAlbum.has(albumName)) {
        tracksByAlbum.set(albumName, []);
      }
      tracksByAlbum.get(albumName)!.push(article);
    });
    
    // Step 4: Combine metadata with tracks
    const albumsWithTracks = albumsMetadata
      .map(albumMeta => {
        const tracks = tracksByAlbum.get(albumMeta.album_name!) || [];
        return {
          _id: albumMeta._id,
          album_name: albumMeta.album_name,
          album_image: albumMeta.album_image,
          album_description: albumMeta.album_description, // 🎯 THIS is what you needed!
          created_at: albumMeta.created_at,
          album_songs: tracks
            .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
            .map(track => ({
              ...track,
              // Ensure compatibility
              title: track.title,
              url: track.url,
              artwork: track.artwork,
              artist: track.artist,
              duration: track.duration,
              contentType: track.contentType,
            })),
          track_count: tracks.length
        };
      })
      .filter(album => album.album_songs.length > 0); // Only albums with synced tracks
    
    return albumsWithTracks;
  },
});

// 🎯 HYBRID: Get audiobooks with metadata + articles chapters
export const getAudiobooksWithMetadata = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Step 1: Get audiobook metadata ONLY (lightweight) from audiobooks table
    const audiobooksMetadata = await ctx.db
      .query("audiobooks")
      .order("desc")
      .take(limit);
    
    // Step 2: Get all audiobook chapters from articles table
    const audiobookArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "audiobook"))
      .order("asc")
      .collect();
    
    // Step 3: Group articles by audiobook name (topic)
    const chaptersByBook = new Map<string, any[]>();
    audiobookArticles.forEach(article => {
      const bookName = article.topic || "Unknown Audiobook";
      if (!chaptersByBook.has(bookName)) {
        chaptersByBook.set(bookName, []);
      }
      chaptersByBook.get(bookName)!.push(article);
    });
    
    // Step 4: Combine metadata with chapters
    const audiobooksWithChapters = audiobooksMetadata
      .map(bookMeta => {
        const chapters = chaptersByBook.get(bookMeta.audiobook_name!) || [];
        return {
          _id: bookMeta._id,
          audiobook_name: bookMeta.audiobook_name,
          author: bookMeta.author, // 🎯 Author from original table
          audiobook_image: bookMeta.audiobook_image, // 🎯 Image from original table
          audiobook_description: bookMeta.audiobook_description, // 🎯 Description from original table
          duration: bookMeta.duration,
          created_at: bookMeta.created_at,
          chapters: chapters
            .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
            .map(chapter => ({
              ...chapter,
              // Ensure compatibility
              title: chapter.title,
              url: chapter.url,
              artwork: chapter.artwork,
              artist: chapter.artist,
              duration: chapter.duration,
              contentType: chapter.contentType,
            })),
          chapter_count: chapters.length
        };
      })
      .filter(book => book.chapters.length > 0); // Only books with synced chapters
    
    return audiobooksWithChapters;
  },
});

// 🎯 HYBRID: Get liner notes with season metadata + articles episodes
export const getLinerNotesWithSeasonMetadata = query({
  args: { 
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    // Step 1: Get season metadata ONLY (lightweight) from liner_notes table
    const seasonsMetadata = await ctx.db
      .query("liner_notes")
      .withIndex("by_liner_note_id")
      .order("desc")
      .take(limit);
    
    // Step 2: Get all liner note episodes from articles table
    const linerNotesArticles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("contentType"), "liner_notes"))
      .order("desc")
      .collect();
    
    // Step 3: Group articles by season name (topic)
    const episodesBySeason = new Map<string, any[]>();
    linerNotesArticles.forEach(article => {
      const seasonName = article.topic || "Unknown Season";
      if (!episodesBySeason.has(seasonName)) {
        episodesBySeason.set(seasonName, []);
      }
      episodesBySeason.get(seasonName)!.push(article);
    });
    
    // Step 4: Combine metadata with episodes
    const seasonsWithEpisodes = seasonsMetadata
      .map(seasonMeta => {
        const episodes = episodesBySeason.get(seasonMeta.name!) || [];
        return {
          _id: seasonMeta._id,
          name: seasonMeta.name,
          season_image: seasonMeta.season_image, // 🎯 Image from original table
          season_description: seasonMeta.season_description, // 🎯 Description from original table
          created_at: seasonMeta.created_at,
          chapters: episodes
            .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()) // 🎯 FIXED: Sort episodes in ascending order (oldest first)
            .map(episode => ({
              ...episode,
              // Ensure compatibility
              title: episode.title,
              url: episode.url,
              artwork: episode.artwork,
              artist: episode.artist,
              duration: episode.duration,
              contentType: episode.contentType,
            })),
          chapter_count: episodes.length
        };
      })
      .filter(season => season.chapters.length > 0); // Only seasons with synced episodes
    
    return seasonsWithEpisodes;
  },
});
