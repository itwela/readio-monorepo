import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all waitlist entries
export const getWaitlist = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("waitlist").collect();
  },
});

// Get waitlist entry by email
export const getWaitlistByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get waitlist entry by ID
export const getWaitlistById = query({
  args: { waitlistId: v.id("waitlist") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.waitlistId);
  },
});

// Add email to waitlist
export const addToWaitlist = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      throw new Error("Email already on waitlist");
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("waitlist", {
      email: args.email,
      created_at: now,
    });
  },
});

// Remove email from waitlist
export const removeFromWaitlist = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const waitlistEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!waitlistEntry) {
      throw new Error("Email not found on waitlist");
    }

    return await ctx.db.delete(waitlistEntry._id);
  },
});

// Get waitlist count
export const getWaitlistCount = query({
  args: {},
  handler: async (ctx) => {
    const waitlist = await ctx.db.query("waitlist").collect();
    return waitlist.length;
  },
});

// Check if email is on waitlist
export const checkEmailOnWaitlist = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return !!entry;
  },
}); 