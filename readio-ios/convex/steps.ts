import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all steps records
export const getSteps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("steps").collect();
  },
});

// Get steps record by ID
export const getStepsById = query({
  args: { stepsId: v.id("steps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.stepsId);
  },
});

// Get latest steps record
export const getLatestSteps = query({
  args: {},
  handler: async (ctx) => {
    const steps = await ctx.db.query("steps").collect();
    return steps.sort((a, b) => 
      new Date(b.updated_at || b.created_at || '').getTime() - 
      new Date(a.updated_at || a.created_at || '').getTime()
    )[0];
  },
});

// Create new steps record
export const createSteps = mutation({
  args: {
    total: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("steps", {
      total: args.total || 0,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update steps record
export const updateSteps = mutation({
  args: {
    stepsId: v.id("steps"),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.stepsId, {
      total: args.total,
      updated_at: new Date().toISOString(),
    });
  },
});

// Increment steps
export const incrementSteps = mutation({
  args: {
    stepsId: v.id("steps"),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const stepsRecord = await ctx.db.get(args.stepsId);
    if (!stepsRecord) throw new Error("Steps record not found");

    return await ctx.db.patch(args.stepsId, {
      total: (stepsRecord.total || 0) + args.increment,
      updated_at: new Date().toISOString(),
    });
  },
});

// Get total steps across all records
export const getTotalSteps = query({
  args: {},
  handler: async (ctx) => {
    const steps = await ctx.db.query("steps").collect();
    return steps.reduce((total, record) => total + (record.total || 0), 0);
  },
});

// Delete steps record
export const deleteSteps = mutation({
  args: {
    stepsId: v.id("steps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.stepsId);
  },
}); 