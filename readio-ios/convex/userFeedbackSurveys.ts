import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 🎯 Create a new feedback survey response
export const createFeedbackSurvey = mutation({
  args: {
    user_email: v.optional(v.string()),
    user_name: v.optional(v.string()),
    responses: v.object({
      dailyUse: v.string(),
      featuresUsed: v.array(v.string()),
      valueRating: v.number(),
      easeOfUse: v.string(),
      frictionPoints: v.string(),
      stickiness: v.string(),
      emotionalConnection: v.string(),
      dailyRhythm: v.string(),
      shareability: v.string(),
      wishlist: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const survey_id = `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await ctx.db.insert("user_feedback_surveys", {
      survey_id,
      user_email: args.user_email,
      user_name: args.user_name,
      responses: args.responses,
      completed_at: now,
      created_at: now,
      updated_at: now,
    });
  },
});

// 🎯 Get all feedback surveys (for admin review)
export const getAllFeedbackSurveys = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("user_feedback_surveys")
      .withIndex("by_created_at")
      .order("desc");
    
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const surveys = await query.take(limit);
    
    const nextCursor = surveys.length === limit 
      ? surveys[surveys.length - 1]._creationTime.toString()
      : null;
    
    return {
      surveys,
      nextCursor,
      hasMore: surveys.length === limit
    };
  },
});

// 🎯 Get feedback surveys by user email (if they want to see their own responses)
export const getFeedbackSurveysByEmail = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_feedback_surveys")
      .withIndex("by_user_email", (q) => q.eq("user_email", args.user_email))
      .order("desc")
      .collect();
  },
});

// 🎯 Get feedback survey by ID
export const getFeedbackSurveyById = query({
  args: { survey_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_feedback_surveys")
      .withIndex("by_survey_id", (q) => q.eq("survey_id", args.survey_id))
      .first();
  },
});

// 🎯 Get feedback survey statistics (aggregated data for insights)
export const getFeedbackSurveyStats = query({
  args: {},
  handler: async (ctx) => {
    const allSurveys = await ctx.db.query("user_feedback_surveys").collect();
    
    if (allSurveys.length === 0) {
      return {
        totalSurveys: 0,
        averageValueRating: 0,
        featureUsage: {},
        shareabilityBreakdown: {},
        dailyUseBreakdown: {},
      };
    }

    // Calculate average value rating
    const totalRating = allSurveys.reduce((sum, survey) => {
      return sum + (survey.responses.valueRating || 0);
    }, 0);
    const averageValueRating = Math.round((totalRating / allSurveys.length) * 10) / 10;

    // Calculate feature usage breakdown
    const featureUsage: Record<string, number> = {};
    allSurveys.forEach(survey => {
      survey.responses.featuresUsed.forEach(feature => {
        // Sanitize feature names to be safe for object keys
        const safeFeature = feature.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        if (safeFeature) {
          featureUsage[safeFeature] = (featureUsage[safeFeature] || 0) + 1;
        }
      });
    });

    // Calculate shareability breakdown
    const shareabilityBreakdown: Record<string, number> = {};
    allSurveys.forEach(survey => {
      const shareability = survey.responses.shareability;
      // Sanitize shareability values to be safe for object keys
      const safeShareability = shareability.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (safeShareability) {
        shareabilityBreakdown[safeShareability] = (shareabilityBreakdown[safeShareability] || 0) + 1;
      }
    });

    // Calculate daily use breakdown
    const dailyUseBreakdown: Record<string, number> = {};
    allSurveys.forEach(survey => {
      const dailyUse = survey.responses.dailyUse;
      // Sanitize daily use values to be safe for object keys
      const safeDailyUse = dailyUse.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (safeDailyUse) {
        dailyUseBreakdown[safeDailyUse] = (dailyUseBreakdown[safeDailyUse] || 0) + 1;
      }
    });

    return {
      totalSurveys: allSurveys.length,
      averageValueRating,
      featureUsage,
      shareabilityBreakdown,
      dailyUseBreakdown,
      recentSurveys: allSurveys.slice(0, 5).map(survey => ({
        id: survey._id,
        survey_id: survey.survey_id,
        completed_at: survey.completed_at,
        valueRating: survey.responses.valueRating,
        shareability: survey.responses.shareability,
        dailyUse: survey.responses.dailyUse,
      })),
    };
  },
});

// 🎯 Search feedback surveys by text content
export const searchFeedbackSurveys = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const allSurveys = await ctx.db.query("user_feedback_surveys").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    
    const matchingSurveys = allSurveys.filter(survey => {
      // Search in text responses
      const textFields = [
        survey.responses.easeOfUse,
        survey.responses.frictionPoints,
        survey.responses.stickiness,
        survey.responses.emotionalConnection,
        survey.responses.dailyRhythm,
        survey.responses.wishlist,
      ];
      
      return textFields.some(text => 
        text.toLowerCase().includes(searchLower)
      ) || 
      // Search in user info
      survey.user_email?.toLowerCase().includes(searchLower) ||
      survey.user_name?.toLowerCase().includes(searchLower);
    });
    
    return matchingSurveys
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, limit);
  },
});

// 🎯 Update feedback survey (if user wants to modify their response)
export const updateFeedbackSurvey = mutation({
  args: {
    survey_id: v.string(),
    responses: v.object({
      dailyUse: v.string(),
      featuresUsed: v.array(v.string()),
      valueRating: v.number(),
      easeOfUse: v.string(),
      frictionPoints: v.string(),
      stickiness: v.string(),
      emotionalConnection: v.string(),
      dailyRhythm: v.string(),
      shareability: v.string(),
      wishlist: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const survey = await ctx.db
      .query("user_feedback_surveys")
      .withIndex("by_survey_id", (q) => q.eq("survey_id", args.survey_id))
      .first();
    
    if (!survey) {
      throw new Error("Survey not found");
    }

    return await ctx.db.patch(survey._id, {
      responses: args.responses,
      updated_at: new Date().toISOString(),
    });
  },
});

// 🎯 Delete feedback survey (admin function)
export const deleteFeedbackSurvey = mutation({
  args: { survey_id: v.string() },
  handler: async (ctx, args) => {
    const survey = await ctx.db
      .query("user_feedback_surveys")
      .withIndex("by_survey_id", (q) => q.eq("survey_id", args.survey_id))
      .first();
    
    if (!survey) {
      throw new Error("Survey not found");
    }

    await ctx.db.delete(survey._id);
    return { success: true, deletedSurveyId: survey._id };
  },
});

// 🎯 Export feedback surveys as CSV data (for admin analysis)
export const exportFeedbackSurveys = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let surveys = await ctx.db.query("user_feedback_surveys").collect();
    
    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      surveys = surveys.filter(survey => {
        const completedDate = new Date(survey.completed_at);
        const startDate = args.startDate ? new Date(args.startDate) : new Date(0);
        const endDate = args.endDate ? new Date(args.endDate) : new Date();
        
        return completedDate >= startDate && completedDate <= endDate;
      });
    }
    
    // Format for CSV export
    const csvData = surveys.map(survey => ({
      survey_id: survey.survey_id,
      user_email: survey.user_email || '',
      user_name: survey.user_name || '',
      completed_at: survey.completed_at,
      daily_use: survey.responses.dailyUse,
      features_used: survey.responses.featuresUsed.join('; '),
      value_rating: survey.responses.valueRating,
      ease_of_use: survey.responses.easeOfUse,
      friction_points: survey.responses.frictionPoints,
      stickiness: survey.responses.stickiness,
      emotional_connection: survey.responses.emotionalConnection,
      daily_rhythm: survey.responses.dailyRhythm,
      shareability: survey.responses.shareability,
      wishlist: survey.responses.wishlist,
    }));
    
    return {
      totalSurveys: csvData.length,
      csvData,
      exportDate: new Date().toISOString(),
    };
  },
});

