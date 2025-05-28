import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all environment variables
export const getEnvVariables = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("env_variables").collect();
  },
});

// Get environment variable by key
export const getEnvVariableByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("env_variables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

// Get environment variable by ID
export const getEnvVariableById = query({
  args: { envVarId: v.id("env_variables") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.envVarId);
  },
});

// Create new environment variable
export const createEnvVariable = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if key already exists
    const existing = await ctx.db
      .query("env_variables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existing) {
      throw new Error("Environment variable with this key already exists");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("env_variables", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update environment variable
export const updateEnvVariable = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const envVar = await ctx.db
      .query("env_variables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (!envVar) {
      throw new Error("Environment variable not found");
    }

    return await ctx.db.patch(envVar._id, {
      value: args.value,
      updated_at: new Date().toISOString(),
    });
  },
});

// Upsert environment variable (create if not exists, update if exists)
export const upsertEnvVariable = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("env_variables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    const now = new Date().toISOString();

    if (existing) {
      // Update existing
      return await ctx.db.patch(existing._id, {
        value: args.value,
        updated_at: now,
      });
    } else {
      // Create new
      return await ctx.db.insert("env_variables", {
        ...args,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

// Delete environment variable
export const deleteEnvVariable = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const envVar = await ctx.db
      .query("env_variables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (!envVar) {
      throw new Error("Environment variable not found");
    }

    return await ctx.db.delete(envVar._id);
  },
}); 