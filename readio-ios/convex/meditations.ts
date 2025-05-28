import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all meditation seasons
export const getMeditationSeasons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("meditations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
  },
});

// Get meditation season by ID
export const getMeditationSeasonById = query({
  args: { meditationId: v.id("meditations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meditationId);
  },
});

// Get meditation season by legacy ID (for migration)
export const getMeditationSeasonByLegacyId = query({
  args: { legacyId: v.number() },
  handler: async (ctx, args) => {
    const meditations = await ctx.db.query("meditations").collect();
    return meditations.find(meditation => meditation.id === args.legacyId) || null;
  },
});

// Get meditation season by name
export const getMeditationSeasonByName = query({
  args: { seasonName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meditations")
      .withIndex("by_meditation_season_name", (q) => q.eq("meditation_season_name", args.seasonName))
      .first();
  },
});

// Create new meditation season
export const createMeditationSeason = mutation({
  args: {
    id: v.optional(v.number()),
    meditation_season_cover: v.optional(v.string()),
    meditation_season_name: v.optional(v.string()),
    meditation_season_intros: v.optional(v.any()),
    meditation_season_music: v.optional(v.any()),
    meditation_season_description: v.optional(v.string()),
    meditation_intro_text: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("meditations", {
      ...args,
      // Set defaults for JSONB fields if not provided
      meditation_season_intros: args.meditation_season_intros || [{}],
      meditation_season_music: args.meditation_season_music || [{}],
      meditation_intro_text: args.meditation_intro_text || [{}],
      created_at: now,
      updated_at: now,
    });
  },
});

// Update meditation season
export const updateMeditationSeason = mutation({
  args: {
    meditationId: v.id("meditations"),
    id: v.optional(v.number()),
    meditation_season_cover: v.optional(v.string()),
    meditation_season_name: v.optional(v.string()),
    meditation_season_intros: v.optional(v.any()),
    meditation_season_music: v.optional(v.any()),
    meditation_season_description: v.optional(v.string()),
    meditation_intro_text: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (args.id !== undefined) updateData.id = args.id;
    if (args.meditation_season_cover) updateData.meditation_season_cover = args.meditation_season_cover;
    if (args.meditation_season_name) updateData.meditation_season_name = args.meditation_season_name;
    if (args.meditation_season_intros) updateData.meditation_season_intros = args.meditation_season_intros;
    if (args.meditation_season_music) updateData.meditation_season_music = args.meditation_season_music;
    if (args.meditation_season_description) updateData.meditation_season_description = args.meditation_season_description;
    if (args.meditation_intro_text) updateData.meditation_intro_text = args.meditation_intro_text;
    
    return await ctx.db.patch(args.meditationId, updateData);
  },
});

// Add intro to meditation season
export const addIntroToSeason = mutation({
  args: {
    meditationId: v.id("meditations"),
    intro: v.any(), // Intro object to add
  },
  handler: async (ctx, args) => {
    const meditation = await ctx.db.get(args.meditationId);
    if (!meditation) {
      throw new Error("Meditation season not found");
    }

    const currentIntros = meditation.meditation_season_intros || [{}];
    const updatedIntros = [...currentIntros, args.intro];

    return await ctx.db.patch(args.meditationId, {
      meditation_season_intros: updatedIntros,
      updated_at: new Date().toISOString(),
    });
  },
});

// Add music to meditation season
export const addMusicToSeason = mutation({
  args: {
    meditationId: v.id("meditations"),
    music: v.any(), // Music object to add
  },
  handler: async (ctx, args) => {
    const meditation = await ctx.db.get(args.meditationId);
    if (!meditation) {
      throw new Error("Meditation season not found");
    }

    const currentMusic = meditation.meditation_season_music || [{}];
    const updatedMusic = [...currentMusic, args.music];

    return await ctx.db.patch(args.meditationId, {
      meditation_season_music: updatedMusic,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update intro in meditation season
export const updateIntroInSeason = mutation({
  args: {
    meditationId: v.id("meditations"),
    introIndex: v.number(),
    intro: v.any(),
  },
  handler: async (ctx, args) => {
    const meditation = await ctx.db.get(args.meditationId);
    if (!meditation) {
      throw new Error("Meditation season not found");
    }

    const currentIntros = meditation.meditation_season_intros || [{}];
    if (args.introIndex >= currentIntros.length || args.introIndex < 0) {
      throw new Error("Intro index out of bounds");
    }

    const updatedIntros = [...currentIntros];
    updatedIntros[args.introIndex] = {
      ...updatedIntros[args.introIndex],
      ...args.intro,
    };

    return await ctx.db.patch(args.meditationId, {
      meditation_season_intros: updatedIntros,
      updated_at: new Date().toISOString(),
    });
  },
});

// Delete meditation season
export const deleteMeditationSeason = mutation({
  args: {
    meditationId: v.id("meditations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.meditationId);
  },
});

// Search meditation seasons
export const searchMeditationSeasons = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const meditations = await ctx.db.query("meditations").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return meditations.filter(meditation => 
      meditation.meditation_season_name?.toLowerCase().includes(searchLower) ||
      meditation.meditation_season_description?.toLowerCase().includes(searchLower)
    );
  },
});

// Get all meditation music (flattened)
export const getAllMeditationMusic = query({
  args: {},
  handler: async (ctx) => {
    const meditations = await ctx.db.query("meditations").collect();
    
    const allMusic: any[] = [];
    meditations.forEach(meditation => {
      if (meditation.meditation_season_music && Array.isArray(meditation.meditation_season_music)) {
        meditation.meditation_season_music.forEach((music: any) => {
          allMusic.push({
            ...music,
            seasonName: meditation.meditation_season_name,
            seasonId: meditation._id,
            seasonCover: meditation.meditation_season_cover,
          });
        });
      }
    });
    
    return allMusic;
  },
});

// Bulk import meditation data (for migration)
export const bulkImportMeditations = mutation({
  args: {
    seasons: v.any(), // Array of meditation season objects
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const seasonData of args.seasons) {
      const now = new Date().toISOString();
      const meditationId = await ctx.db.insert("meditations", {
        id: seasonData.id,
        meditation_season_cover: seasonData.meditation_season_cover,
        meditation_season_name: seasonData.meditation_season_name,
        meditation_season_intros: seasonData.meditation_season_intros || [{}],
        meditation_season_music: seasonData.meditation_season_music || [{}],
        meditation_season_description: seasonData.meditation_season_description,
        meditation_intro_text: seasonData.meditation_intro_text || [{}],
        created_at: now,
        updated_at: now,
      });
      results.push(meditationId);
    }
    
    return results;
  },
}); 