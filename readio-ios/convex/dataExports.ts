import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to export articles with key fields
export const exportArticles = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let articlesQuery = ctx.db.query("articles");
    
    if (args.startDate) {
      articlesQuery = articlesQuery.filter(q => 
        q.gte(q.field("created_at"), args.startDate as string)
      );
    }
    
    if (args.endDate) {
      articlesQuery = articlesQuery.filter(q => 
        q.lte(q.field("created_at"), args.endDate as string)
      );
    }
    
    const articles = await articlesQuery.collect();
    
    return articles.map(article => ({
      artist: article.artist,
      text: article.text,
      title: article.title,
      created_at: article.created_at
    }));
  }
});

// Query to export steps leaderboard
export const exportStepsLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const leaderboard = await ctx.db.query("steps_leaderboard").collect();
    
    return leaderboard.map(entry => ({
      name: entry.name,
      step_value: entry.step_value,
      user_db_id: entry.user_db_id
    }));
  }
});

// Query to export timer presets
export const exportTimerPresets = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let presetsQuery = ctx.db.query("timer_presets");
    
    if (args.startDate) {
      presetsQuery = presetsQuery.filter(q => 
        q.gte(q.field("createdAt"), args.startDate as string)
      );
    }
    
    if (args.endDate) {
      presetsQuery = presetsQuery.filter(q => 
        q.lte(q.field("createdAt"), args.endDate as string)
      );
    }
    
    const presets = await presetsQuery.collect();
    
    return presets.map(preset => ({
      userId: preset.userId,
      createdAt: preset.createdAt,
      timerMode: preset.timerMode,
      name: preset.name
    }));
  }
});

// Query to export users aggregated by name (unique by name)
export const exportUsersAggregated = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    // Aggregate users by name
    const usersByName = new Map();
    
    allUsers.forEach(user => {
      const name = user.name || 'Unknown';
      
      if (!usersByName.has(name)) {
        usersByName.set(name, {
          name: name,
          user_db_ids: [],
          earliest_created_at: user.created_at,
          latest_created_at: user.created_at,
          total_meditation_minutes: 0,
          total_stic_voice_usage_seconds: 0,
          highest_meditation_streak: 0,
          highest_giant_steps_streak: 0,
          current_meditation_streaks: [],
          current_giant_steps_streaks: [],
          subscription_plans: []
        });
      }
      
      const aggregated = usersByName.get(name);
      aggregated.user_db_ids.push(user.user_db_id);
      
      // Aggregate timestamps
      if (user.created_at && user.created_at < aggregated.earliest_created_at) {
        aggregated.earliest_created_at = user.created_at;
      }
      if (user.created_at && user.created_at > aggregated.latest_created_at) {
        aggregated.latest_created_at = user.created_at;
      }
      
      // Aggregate metrics
      aggregated.total_meditation_minutes += user.user_meditation_minutes || 0;
      aggregated.total_stic_voice_usage_seconds += user.stic_voice_usage_seconds || 0;
      
      // Track highest streaks
      if ((user.meditation_highest_streak || 0) > aggregated.highest_meditation_streak) {
        aggregated.highest_meditation_streak = user.meditation_highest_streak || 0;
      }
      if ((user.giant_steps_highest_streak || 0) > aggregated.highest_giant_steps_streak) {
        aggregated.highest_giant_steps_streak = user.giant_steps_highest_streak || 0;
      }
      
      // Collect current streaks
      if (user.meditation_current_streak) {
        aggregated.current_meditation_streaks.push(user.meditation_current_streak);
      }
      if (user.giant_steps_current_streak) {
        aggregated.current_giant_steps_streaks.push(user.giant_steps_current_streak);
      }
      
      // Track subscription plans
      if (user.subscription_plan) {
        aggregated.subscription_plans.push(user.subscription_plan);
      }
    });
    
    return Array.from(usersByName.values()).map(user => ({
      name: user.name,
      user_db_ids: user.user_db_ids,
      account_count: user.user_db_ids.length,
      earliest_created_at: user.earliest_created_at,
      latest_created_at: user.latest_created_at,
      total_meditation_minutes: user.total_meditation_minutes,
      total_stic_voice_usage_seconds: user.total_stic_voice_usage_seconds,
      highest_meditation_streak: user.highest_meditation_streak,
      highest_giant_steps_streak: user.highest_giant_steps_streak,
      subscription_plans: user.subscription_plans,
      is_paid_subscriber: user.subscription_plans.some((plan: string) => 
        plan === 'starter' || plan === 'premium'
      )
    }));
  }
});

// Comprehensive export combining all data sources
export const exportComprehensiveUsageData = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Get all data
    const articlesQuery = ctx.db.query("articles");
    let filteredArticlesQuery = articlesQuery;
    
    if (args.startDate) {
      filteredArticlesQuery = filteredArticlesQuery.filter(q => 
        q.gte(q.field("created_at"), args.startDate as string)
      );
    }
    if (args.endDate) {
      filteredArticlesQuery = filteredArticlesQuery.filter(q => 
        q.lte(q.field("created_at"), args.endDate as string)
      );
    }
    
    const articles = await filteredArticlesQuery.collect();
    const leaderboard = await ctx.db.query("steps_leaderboard").collect();
    
    let presetsQuery = ctx.db.query("timer_presets");
    if (args.startDate) {
      presetsQuery = presetsQuery.filter(q => 
        q.gte(q.field("createdAt"), args.startDate as string)
      );
    }
    if (args.endDate) {
      presetsQuery = presetsQuery.filter(q => 
        q.lte(q.field("createdAt"), args.endDate as string)
      );
    }
    const presets = await presetsQuery.collect();
    
    const allUsers = await ctx.db.query("users").collect();
    
    // Aggregate users by name
    const usersByName = new Map();
    allUsers.forEach(user => {
      const name = user.name || 'Unknown';
      if (!usersByName.has(name)) {
        usersByName.set(name, {
          name: name,
          user_db_ids: [],
          earliest_created_at: user.created_at,
          latest_created_at: user.created_at,
          total_meditation_minutes: 0,
          total_stic_voice_usage_seconds: 0,
          highest_meditation_streak: 0,
          highest_giant_steps_streak: 0,
          subscription_plans: []
        });
      }
      const aggregated = usersByName.get(name);
      aggregated.user_db_ids.push(user.user_db_id);
      if (user.created_at && user.created_at < aggregated.earliest_created_at) {
        aggregated.earliest_created_at = user.created_at;
      }
      if (user.created_at && user.created_at > aggregated.latest_created_at) {
        aggregated.latest_created_at = user.created_at;
      }
      aggregated.total_meditation_minutes += user.user_meditation_minutes || 0;
      aggregated.total_stic_voice_usage_seconds += user.stic_voice_usage_seconds || 0;
      if ((user.meditation_highest_streak || 0) > aggregated.highest_meditation_streak) {
        aggregated.highest_meditation_streak = user.meditation_highest_streak || 0;
      }
      if ((user.giant_steps_highest_streak || 0) > aggregated.highest_giant_steps_streak) {
        aggregated.highest_giant_steps_streak = user.giant_steps_highest_streak || 0;
      }
      if (user.subscription_plan) {
        aggregated.subscription_plans.push(user.subscription_plan);
      }
    });
    
    const aggregatedUsers = Array.from(usersByName.values()).map(user => ({
      name: user.name,
      user_db_ids: user.user_db_ids,
      account_count: user.user_db_ids.length,
      earliest_created_at: user.earliest_created_at,
      latest_created_at: user.latest_created_at,
      total_meditation_minutes: user.total_meditation_minutes,
      total_stic_voice_usage_seconds: user.total_stic_voice_usage_seconds,
      highest_meditation_streak: user.highest_meditation_streak,
      highest_giant_steps_streak: user.highest_giant_steps_streak,
      subscription_plans: user.subscription_plans,
      is_paid_subscriber: user.subscription_plans.some((plan: string) => 
        plan === 'starter' || plan === 'premium'
      )
    }));
    
    // Calculate summary metrics
    const totalUsers = aggregatedUsers.length;
    const paidUsers = aggregatedUsers.filter(u => u.is_paid_subscriber).length;
    const totalArticles = articles.length;
    const totalTimerPresets = presets.length;
    
    // Timer mode breakdown
    const timerModeBreakdown = presets.reduce((acc: any, preset) => {
      const mode = preset.timerMode || 'Unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});
    
    // Subscription breakdown
    const subscriptionBreakdown = {
      blank: 0,
      starter: 0,
      premium: 0
    };
    aggregatedUsers.forEach(user => {
      user.subscription_plans.forEach((plan: string) => {
        if (plan === 'blank') subscriptionBreakdown.blank++;
        else if (plan === 'starter') subscriptionBreakdown.starter++;
        else if (plan === 'premium') subscriptionBreakdown.premium++;
      });
    });
    
    return {
      metadata: {
        export_date: new Date().toISOString(),
        start_date: args.startDate,
        end_date: args.endDate
      },
      summary: {
        total_unique_users: totalUsers,
        paid_users: paidUsers,
        free_users: totalUsers - paidUsers,
        total_articles: totalArticles,
        total_timer_presets: totalTimerPresets,
        total_leaderboard_entries: leaderboard.length,
        subscription_breakdown: subscriptionBreakdown,
        timer_mode_breakdown: timerModeBreakdown
      },
      articles: articles.map(article => ({
        artist: article.artist,
        text: article.text,
        title: article.title,
        created_at: article.created_at
      })),
      steps_leaderboard: leaderboard.map(entry => ({
        name: entry.name,
        step_value: entry.step_value,
        user_db_id: entry.user_db_id
      })),
      timer_presets: presets.map(preset => ({
        userId: preset.userId,
        createdAt: preset.createdAt,
        timerMode: preset.timerMode,
        name: preset.name
      })),
      users: aggregatedUsers
    };
  }
});

