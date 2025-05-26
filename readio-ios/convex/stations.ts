import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all stations
export const getStations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stations").collect();
  },
});

// Get station by name
export const getStationByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Get stations by user
export const getStationsByUser = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stations")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .collect();
  },
});

// Create new station
export const createStation = mutation({
  args: {
    name: v.string(),
    imageurl: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("stations", {
      ...args,
      created_at: now,
    });
  },
});

// Update station
export const updateStation = mutation({
  args: {
    stationId: v.id("stations"),
    name: v.optional(v.string()),
    imageurl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    
    if (args.name) updateData.name = args.name;
    if (args.imageurl) updateData.imageurl = args.imageurl;
    
    return await ctx.db.patch(args.stationId, updateData);
  },
});

// Delete station
export const deleteStation = mutation({
  args: {
    stationId: v.id("stations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.stationId);
  },
}); 