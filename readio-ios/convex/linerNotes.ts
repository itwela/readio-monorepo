import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all liner note seasons
export const getLinerNoteSeasons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("liner_notes")
      .withIndex("by_liner_note_id")
      .order("desc")
      .collect();
  },
});

// Get liner note season by ID
export const getLinerNoteSeasonById = query({
  args: { seasonId: v.id("liner_notes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.seasonId);
  },
});

// Get liner note season by legacy ID (for migration)
export const getLinerNoteSeasonByLegacyId = query({
  args: { legacyId: v.number() },
  handler: async (ctx, args) => {
    const seasons = await ctx.db.query("liner_notes").collect();
    return seasons.find(season => season.liner_note_id === args.legacyId) || null;
  },
});

// Get liner note season by name
export const getLinerNoteSeasonByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("liner_notes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create new liner note season
export const createLinerNoteSeason = mutation({
  args: {
    id: v.optional(v.number()),
    name: v.string(),
    season_image: v.optional(v.string()),
    season_description: v.optional(v.string()),
    chapters: v.any(), // Array of chapter objects
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("liner_notes", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update liner note season
export const updateLinerNoteSeason = mutation({
  args: {
    seasonId: v.id("liner_notes"),
    id: v.optional(v.number()),
    name: v.optional(v.string()),
    season_image: v.optional(v.string()),
    season_description: v.optional(v.string()),
    chapters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (args.id !== undefined) updateData.id = args.id;
    if (args.name) updateData.name = args.name;
    if (args.season_image) updateData.season_image = args.season_image;
    if (args.season_description) updateData.season_description = args.season_description;
    if (args.chapters) updateData.chapters = args.chapters;
    
    return await ctx.db.patch(args.seasonId, updateData);
  },
});

// Add chapter to season
export const addChapterToSeason = mutation({
  args: {
    seasonId: v.id("liner_notes"),
    chapter: v.object({
      url: v.string(),
      title: v.string(),
      topic: v.string(),
      artist: v.string(),
      artwork: v.string(),
      contentType: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const season = await ctx.db.get(args.seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    const currentChapters = season.chapters || [];
    const updatedChapters = [...currentChapters, args.chapter];

    return await ctx.db.patch(args.seasonId, {
      chapters: updatedChapters,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update chapter in season
export const updateChapterInSeason = mutation({
  args: {
    seasonId: v.id("liner_notes"),
    chapterIndex: v.number(),
    chapter: v.object({
      url: v.optional(v.string()),
      title: v.optional(v.string()),
      topic: v.optional(v.string()),
      artist: v.optional(v.string()),
      artwork: v.optional(v.string()),
      contentType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const season = await ctx.db.get(args.seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    const currentChapters = season.chapters || [];
    if (args.chapterIndex >= currentChapters.length || args.chapterIndex < 0) {
      throw new Error("Chapter index out of bounds");
    }

    const updatedChapters = [...currentChapters];
    updatedChapters[args.chapterIndex] = {
      ...updatedChapters[args.chapterIndex],
      ...args.chapter,
    };

    return await ctx.db.patch(args.seasonId, {
      chapters: updatedChapters,
      updated_at: new Date().toISOString(),
    });
  },
});

// Remove chapter from season
export const removeChapterFromSeason = mutation({
  args: {
    seasonId: v.id("liner_notes"),
    chapterIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const season = await ctx.db.get(args.seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    const currentChapters = season.chapters || [];
    if (args.chapterIndex >= currentChapters.length || args.chapterIndex < 0) {
      throw new Error("Chapter index out of bounds");
    }

    const updatedChapters = currentChapters.filter((_: any, index: number) => index !== args.chapterIndex);

    return await ctx.db.patch(args.seasonId, {
      chapters: updatedChapters,
      updated_at: new Date().toISOString(),
    });
  },
});

// Delete liner note season
export const deleteLinerNoteSeason = mutation({
  args: {
    seasonId: v.id("liner_notes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.seasonId);
  },
});

// Search liner note seasons and chapters
export const searchLinerNotes = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const seasons = await ctx.db.query("liner_notes").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return seasons.filter(season => {
      // Search in season name and description
      const seasonMatch = season.name?.toLowerCase().includes(searchLower) ||
                         season.season_description?.toLowerCase().includes(searchLower);
      
      // Search in chapters
      const chapterMatch = season.chapters?.some((chapter: any) =>
        chapter.title?.toLowerCase().includes(searchLower) ||
        chapter.topic?.toLowerCase().includes(searchLower) ||
        chapter.artist?.toLowerCase().includes(searchLower)
      );
      
      return seasonMatch || chapterMatch;
    });
  },
});

// Get all chapters from all seasons (flattened)
export const getAllChapters = query({
  args: {},
  handler: async (ctx) => {
    const seasons = await ctx.db.query("liner_notes").collect();
    
    const allChapters: any[] = [];
    seasons.forEach(season => {
      if (season.chapters && Array.isArray(season.chapters)) {
        season.chapters.forEach((chapter: any) => {
          allChapters.push({
            ...chapter,
            seasonName: season.name,
            seasonId: season._id,
            seasonImage: season.season_image,
          });
        });
      }
    });
    
    return allChapters;
  },
});

// Get liner note seasons with chapters that have article IDs
export const getLinerNoteSeasonsWithArticleIds = query({
  args: {},
  handler: async (ctx) => {
    const seasons = await ctx.db
      .query("liner_notes")
      .withIndex("by_liner_note_id")
      .order("desc")
      .collect();
    
    const seasonsWithArticleIds = await Promise.all(
      seasons.map(async (season) => {
        if (season.chapters && Array.isArray(season.chapters)) {
          const chaptersWithArticleIds = await Promise.all(
            season.chapters.map(async (chapter: any, index: number) => {
              // Look for existing article with this chapter's URL
              const existingArticle = await ctx.db
                .query("articles")
                .filter((q) => q.eq(q.field("url"), chapter.url))
                .first();
              
              return {
                ...chapter,
                _id: existingArticle?._id || `${season._id}-chapter-${index}`, // Use actual article ID if exists
                season_id: season._id,
                contentType: chapter.contentType || 'liner_notes'
              };
            })
          );
          
          return {
            ...season,
            chapters: chaptersWithArticleIds
          };
        }
        return season;
      })
    );
    
    return seasonsWithArticleIds;
  },
});

// Sync liner note chapters to articles table
export const syncLinerNoteChaptersToArticles = mutation({
  args: {},
  handler: async (ctx) => {
    const seasons = await ctx.db.query("liner_notes").collect();
    const syncResults = [];
    
    for (const season of seasons) {
      if (season.chapters && Array.isArray(season.chapters)) {
        for (const chapter of season.chapters) {
          // Check if article already exists for this chapter
          const existingArticle = await ctx.db
            .query("articles")
            .filter((q) => q.eq(q.field("url"), chapter.url))
            .first();
          
          if (!existingArticle) {
            // Create new article for this chapter
            const articleId = await ctx.db.insert("articles", {
              title: chapter.title || "Untitled Chapter",
              url: chapter.url,
              artwork: chapter.artwork || season.season_image,
              artist: chapter.artist || "Lotus",
              topic: season.name || "Liner Notes",
              contentType: "liner_notes",
              duration: chapter.duration || 0,
              favorited: false,
              featured: false,
              nsfw: false,
              upvotes: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            syncResults.push({
              chapter: chapter.title,
              season: season.name,
              articleId,
              status: 'created'
            });
          } else {
            syncResults.push({
              chapter: chapter.title,
              season: season.name,
              articleId: existingArticle._id,
              status: 'exists'
            });
          }
        }
      }
    }
    
    return syncResults;
  },
});

// Bulk import liner note data (for migration)
export const bulkImportLinerNotes = mutation({
  args: {
    seasons: v.any(), // Array of season objects matching your data structure
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const seasonData of args.seasons) {
      const now = new Date().toISOString();
      const seasonId = await ctx.db.insert("liner_notes", {
        liner_note_id: seasonData.id,
        name: seasonData.name,
        season_image: seasonData.seasonImage,
        season_description: seasonData.season_description,
        chapters: seasonData.chapters,
        created_at: now,
        updated_at: now,
      });
      results.push(seasonId);
    }
    
    return results;
  },
});

// 🎯 BANDWIDTH OPTIMIZED: Get liner note seasons with chapters (paginated and optimized)
export const getLinerNoteSeasonsWithArticleIdsPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5; // Default to 5 seasons
    
    let query = ctx.db
      .query("liner_notes")
      .withIndex("by_liner_note_id")
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const seasons = await query.take(limit);
    
    // Batch approach for better performance
    const allUrls: string[] = [];
    seasons.forEach(season => {
      if (season.chapters && Array.isArray(season.chapters)) {
        season.chapters.forEach((chapter: any) => {
          if (chapter.url) {
            allUrls.push(chapter.url);
          }
        });
      }
    });
    
    if (allUrls.length === 0) {
      return {
        seasons,
        nextCursor: seasons.length === limit ? seasons[seasons.length - 1]._creationTime.toString() : null,
        hasMore: seasons.length === limit
      };
    }
    
    // Single batch query instead of individual queries
    const allArticles = await ctx.db
      .query("articles")
      .filter((q) => {
        // Simplified filter approach to avoid TypeScript issues
        return q.eq(q.field("contentType"), "liner_notes");
      })
      .collect();
    
    // Create URL to article ID map for fast lookup
    const urlToArticleMap = new Map(
      allArticles.map(article => [article.url, article._id])
    );
    
    const seasonsWithArticleIds = seasons.map(season => {
      if (season.chapters && Array.isArray(season.chapters)) {
        const chaptersWithArticleIds = season.chapters.map((chapter: any, index: number) => ({
          ...chapter,
          _id: urlToArticleMap.get(chapter.url) || `${season._id}-chapter-${index}`,
          season_id: season._id,
          contentType: chapter.contentType || 'liner_notes'
        }));
        
        return {
          ...season,
          chapters: chaptersWithArticleIds
        };
      }
      return season;
    });
    
    const nextCursor = seasons.length === limit 
      ? seasons[seasons.length - 1]._creationTime.toString()
      : null;
    
    return {
      seasons: seasonsWithArticleIds,
      nextCursor,
      hasMore: seasons.length === limit
    };
  },
});

// 🎯 BANDWIDTH OPTIMIZED: Get liner note seasons (lightweight metadata only)
export const getLinerNoteSeasonsLight = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const seasons = await ctx.db
      .query("liner_notes")
      .withIndex("by_liner_note_id")
      .order("desc")
      .take(limit);
    
    // Return only essential metadata, no heavy chapter data
    return seasons.map(season => ({
      _id: season._id,
      name: season.name,
      season_image: season.season_image,
      description: season.season_description,
      chapter_count: season.chapters?.length || 0,
      created_at: season.created_at,
      // Exclude heavy fields: chapters (contains all chapter data)
    }));
  },
}); 