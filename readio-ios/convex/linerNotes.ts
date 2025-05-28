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