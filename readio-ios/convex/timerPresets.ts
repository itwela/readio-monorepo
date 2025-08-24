import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Define the simplified timer preset schema
const timerPresetSchema = v.object({
  name: v.string(),
  description: v.string(),
  userId: v.string(),
  isPublic: v.boolean(),
  duration: v.number(),
  rounds: v.number(),
  rest: v.number(),
  preparation: v.number(),
  timerMode: v.union(v.literal('Workout'), v.literal('Workflow'), v.literal('Work-In')),
  tags: v.array(v.string()),
  createdAt: v.string(),
  type: v.string(),
  totalTimers: v.number(),
  totalDuration: v.string(),
  totalRounds: v.number(),
  roundDurationType: v.string(),
});

// Create a new timer preset
export const createTimerPreset = mutation({
  args: timerPresetSchema,
  handler: async (ctx, args) => {
    try {
      const presetId = await ctx.db.insert('timer_presets', {
        ...args,
        // createdAt: new Date().toISOString(),
      });
      
      return { 
        success: true, 
        presetId,
        message: 'Timer preset saved successfully!'
      };
    } catch (error) {
      console.error('Error creating timer preset:', error);
      return { 
        success: false, 
        error: 'Failed to save timer preset' 
      };
    }
  },
});

// Get user's timer presets
export const getUserTimerPresets = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      const presets = await ctx.db
        .query('timer_presets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .order('desc')
        .collect();
        
      return { success: true, presets };
    } catch (error) {
      console.error('Error fetching user timer presets:', error);
      return { success: false, error: 'Failed to fetch timer presets' };
    }
  },
});

// Get public timer presets
export const getPublicTimerPresets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    try {
      const limit = args.limit || 20;
      const presets = await ctx.db
        .query('timer_presets')
        .withIndex('by_public', (q) => q.eq('isPublic', true))
        .order('desc')
        .take(limit);
        
      return { success: true, presets };
    } catch (error) {
      console.error('Error fetching public timer presets:', error);
      return { success: false, error: 'Failed to fetch public timer presets' };
    }
  },
});

// Update timer preset
export const updateTimerPreset = mutation({
  args: {
    presetId: v.id('timer_presets'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      rounds: v.optional(v.number()),
      duration: v.optional(v.number()),
      rest: v.optional(v.number()),
      preparation: v.optional(v.number()),
      timerMode: v.optional(v.union(v.literal('Workout'), v.literal('Workflow'), v.literal('Work-In'))),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.presetId, args.updates);
      return { success: true, message: 'Timer preset updated successfully!' };
    } catch (error) {
      console.error('Error updating timer preset:', error);
      return { success: false, error: 'Failed to update timer preset' };
    }
  },
});

// Delete timer preset
export const deleteTimerPreset = mutation({
  args: { presetId: v.id('timer_presets') },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.presetId);
      return { success: true, message: 'Timer preset deleted successfully!' };
    } catch (error) {
      console.error('Error deleting timer preset:', error);
      return { success: false, error: 'Failed to delete timer preset' };
    }
  },
});

// Search timer presets
export const searchTimerPresets = query({
  args: { 
    searchTerm: v.string(),
    userId: v.optional(v.string()),
    includePublic: v.optional(v.boolean()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    try {
      const limit = args.limit || 10;
      const searchTerm = args.searchTerm.toLowerCase();
      
      let results: any[] = [];
      
      // Search user's presets if userId provided
      if (args.userId) {
        const userPresets = await ctx.db
          .query('timer_presets')
          .withIndex('by_user', (q) => q.eq('userId', args.userId!))
          .collect();
          
        const userMatches = userPresets.filter(preset => 
          preset.name.toLowerCase().includes(searchTerm) ||
          preset.description.toLowerCase().includes(searchTerm) ||
          preset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        results = [...userMatches];
      }
      
      // Search public presets if requested
      if (args.includePublic) {
        const publicPresets = await ctx.db
          .query('timer_presets')
          .withIndex('by_public', (q) => q.eq('isPublic', true))
          .collect();
          
        const publicMatches = publicPresets.filter(preset => 
          preset.name.toLowerCase().includes(searchTerm) ||
          preset.description.toLowerCase().includes(searchTerm) ||
          preset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        results = [...results, ...publicMatches];
      }
      
      // Remove duplicates and limit results
      const uniqueResults = results
        .filter((preset, index, self) => 
          index === self.findIndex(p => p._id === preset._id)
        )
        .slice(0, limit);
        
      return { success: true, presets: uniqueResults };
    } catch (error) {
      console.error('Error searching timer presets:', error);
      return { success: false, error: 'Failed to search timer presets' };
    }
  },
}); 