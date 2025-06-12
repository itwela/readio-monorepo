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

// Get audiobooks with chapters that have article IDs
// export const getAudiobooksWithArticleIds = query({
//   args: {},
//   handler: async (ctx) => {
//     const audiobooks = await ctx.db
//       .query("audiobooks")
//       .order("desc")
//       .collect();
    
//     const audiobooksWithArticleIds = await Promise.all(
//       audiobooks.map(async (audiobook) => {
//         if (audiobook.chapters && Array.isArray(audiobook.chapters)) {
//           const chaptersWithArticleIds = await Promise.all(
//             audiobook.chapters.map(async (chapter: any, index: number) => {
//               // Look for existing article with this chapter's URL
//               const existingArticle = await ctx.db
//                 .query("articles")
//                 .filter((q) => q.eq(q.field("url"), chapter.url))
//                 .first();
              
//               return {
//                 ...chapter,
//                 _id: existingArticle?._id || `${audiobook._id}-chapter-${index}`, // Use actual article ID if exists
//                 audiobook_id: audiobook._id,
//                 contentType: chapter.contentType || 'audiobook'
//               };
//             })
//           );
          
//           return {
//             ...audiobook,
//             chapters: chaptersWithArticleIds
//           };
//         }
//         return audiobook;
//       })
//     );
    
//     return audiobooksWithArticleIds;
//   },
// });


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

// 🎯 BANDWIDTH OPTIMIZED: Get audiobooks with chapters (paginated and optimized)
export const getAudiobooksWithArticleIdsPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5; // Default to 5 audiobooks (audiobooks are large)
    
    let query = ctx.db.query("audiobooks").order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const audiobooks = await query.take(limit);
    
    // Batch query approach for better performance
    const allUrls: string[] = [];
    audiobooks.forEach(audiobook => {
      if (audiobook.chapters && Array.isArray(audiobook.chapters)) {
        audiobook.chapters.forEach((chapter: any) => {
          if (chapter.url) {
            allUrls.push(chapter.url);
          }
        });
      }
    });
    
    if (allUrls.length === 0) {
      return {
        audiobooks,
        nextCursor: audiobooks.length === limit ? audiobooks[audiobooks.length - 1]._creationTime.toString() : null,
        hasMore: audiobooks.length === limit
      };
    }
    
    // Single query to get all matching articles (much more efficient than N+1 queries)
    const allArticles = await ctx.db
      .query("articles")
      .filter((q) => allUrls.some(url => q.eq(q.field("url"), url)))
      .collect();
    
    // Create URL to article ID map for fast lookup
    const urlToArticleMap = new Map(
      allArticles.map(article => [article.url, article._id])
    );
    
    const audiobooksWithArticleIds = audiobooks.map(audiobook => {
      if (audiobook.chapters && Array.isArray(audiobook.chapters)) {
        const chaptersWithArticleIds = audiobook.chapters.map((chapter: any, index: number) => ({
          ...chapter,
          _id: urlToArticleMap.get(chapter.url) || `${audiobook._id}-chapter-${index}`,
          audiobook_id: audiobook._id,
          contentType: chapter.contentType || 'audiobook'
        }));
        
        return {
          ...audiobook,
          chapters: chaptersWithArticleIds
        };
      }
      return audiobook;
    });
    
    const nextCursor = audiobooks.length === limit 
      ? audiobooks[audiobooks.length - 1]._creationTime.toString()
      : null;
    
    return {
      audiobooks: audiobooksWithArticleIds,
      nextCursor,
      hasMore: audiobooks.length === limit
    };
  },
}); 