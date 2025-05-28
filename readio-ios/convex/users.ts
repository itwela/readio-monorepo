import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all users
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get use
// r by JWT
export const getUserByJWT = query({
  args: { 
    jwt: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_jwt", (q) => q.eq("jwt", args.jwt))
      .first();
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by user_db_id
export const getUserByDbId = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .first();
  },
});

// Get user by email and password (for sign in)
export const getUserByEmailAndPassword = query({
  args: { 
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .filter((q) => q.eq(q.field("pass"), args.password))
      .first();
  },
});

// Create new user
export const createUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    pass: v.optional(v.string()),
    jwt: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    subscription_plan: v.optional(v.string()),
    subscription_tier: v.optional(v.string()),
    user_role: v.optional(v.string()),
    coin_balance: v.optional(v.number()),
    article_generation_runs: v.optional(v.number()),
    article_generation_runs_limit: v.optional(v.number()),
    upvotes: v.optional(v.number()),
    usersteps: v.optional(v.number()),
    user_meditation_minutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("users", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update user subscription plan and limits
export const updateUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscription_plan: v.string(),
    article_generation_runs_limit: v.number(),
    resetRuns: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      subscription_plan: args.subscription_plan,
      article_generation_runs_limit: args.article_generation_runs_limit,
      updated_at: new Date().toISOString(),
    };

    if (args.resetRuns) {
      updateData.article_generation_runs = 0;
      updateData.article_runs_last_reset_at = new Date().toISOString();
    }

    return await ctx.db.patch(args.userId, updateData);
  },
});

// Update user article generation runs
export const incrementArticleRuns = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.patch(args.userId, {
      article_generation_runs: (user.article_generation_runs || 0) + 1,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user steps
export const updateUserSteps = mutation({
  args: {
    user_db_id: v.string(),
    steps: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .first();
    
    if (!user) throw new Error("User not found");

    return await ctx.db.patch(user._id, {
      usersteps: (user.usersteps || 0) + args.steps,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user presence streak
export const updateMeditationStreak = mutation({
  args: {
    userId: v.id("users"),
    currentStreak: v.any(),
    highestStreak: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      meditation_current_streak: args.currentStreak,
      meditation_highest_streak: args.highestStreak,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user giant steps streak
export const updateGiantStepsStreak = mutation({
  args: {
    userId: v.id("users"),
    currentStreak: v.any(),
    highestStreak: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      giant_steps_current_streak: args.currentStreak,
      giant_steps_highest_streak: args.highestStreak,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user presence stats
export const updateMeditationStats = mutation({
  args: {
    userId: v.id("users"),
    meditationStats: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      meditation_stats: args.meditationStats,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user giant steps stats
export const updateGiantStepsStats = mutation({
  args: {
    userId: v.id("users"),
    giantStepsStats: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      giant_steps_stats: args.giantStepsStats,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    jwt: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pass: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_jwt", (q) => q.eq("jwt", args.jwt))
      .first();
    
    if (!user) throw new Error("User not found");

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (args.name) updateData.name = args.name;
    if (args.email) updateData.email = args.email;
    if (args.pass) updateData.pass = args.pass;

    return await ctx.db.patch(user._id, updateData);
  },
});

// Monthly reset for article generation runs
export const monthlyResetArticleRuns = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      article_generation_runs: 0,
      article_runs_last_reset_at: new Date().toISOString(),
      stic_voice_usage_seconds: 0,
      updated_at: new Date().toISOString(),
    });
  },
});

// Get total steps across all users
export const getTotalSteps = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.reduce((total, user) => total + (user.usersteps || 0), 0);
  },
});

// Update user meditation minutes
export const updateMeditationMinutes = mutation({
  args: {
    userId: v.id("users"),
    minutes: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.patch(args.userId, {
      user_meditation_minutes: (user.user_meditation_minutes || 0) + args.minutes,
      updated_at: new Date().toISOString(),
    });
  },
});

// Update user voice usage (for ElevenLabs tracking)
export const updateVoiceUsage = mutation({
  args: {
    userId: v.id("users"),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.patch(args.userId, {
      stic_voice_usage_seconds: (user.stic_voice_usage_seconds || 0) + args.duration,
      updated_at: new Date().toISOString(),
    });
  },
});
