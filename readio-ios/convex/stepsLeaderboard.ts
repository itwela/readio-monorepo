import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all steps leaderboard records
export const getStepsLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const stepsLeaderboard = await ctx.db.query("steps_leaderboard").collect();
    return stepsLeaderboard;
  },
});

// Add new entry to steps leaderboard
export const addStepsLeaderboard = mutation({
  args: {
    user_db_id: v.string(),
    step_value: v.number(),
    user_email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { user_db_id, step_value, user_email, name } = args;
    const stepsLeaderboard = await ctx.db.insert("steps_leaderboard", {
      user_db_id,
      step_value,
      user_email,
      name,
    });
    return stepsLeaderboard;
  },
});

// Update steps leaderboard record
export const updateStepsLeaderboard = mutation({
  args: {
    id: v.string(), // ID of the leaderboard entry to update
    step_value: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, step_value } = args;
    const stepsLeaderboard = await ctx.db.patch(id as any, {
      step_value,
    });
    return stepsLeaderboard;
  },
});

// Get specific leaderboard data for a user
export const getUserStepsLeaderboard = query({
  args: { user_db_id: v.string() }, // User ID to fetch the leaderboard data for
  handler: async (ctx, args) => {
    const { user_db_id } = args;
    const userLeaderboardData = await ctx.db
      .query("steps_leaderboard")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", user_db_id))
      .first(); // Assuming you have an index for user_db_id
    return userLeaderboardData;
  },
});

