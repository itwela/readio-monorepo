import { query } from "./_generated/server";
import { v } from "convex/values";

// 🎯 BANDWIDTH MONITORING - Track query usage patterns
export const getBandwidthStats = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get recent content analytics to estimate bandwidth usage
    const recentAnalytics = await ctx.db
      .query("content_analytics")
      .filter(q => q.gte(q.field("created_at"), startOfMonth.toISOString()))
      .collect();
    
    // Get article counts by type
    const articles = await ctx.db.query("articles").collect();
    const totalTextSize = articles.reduce((sum, article) => {
      return sum + (article.text?.length || 0);
    }, 0);
    
    // Estimate bandwidth usage
    const avgArticleSize = totalTextSize / Math.max(articles.length, 1);
    const totalQueries = recentAnalytics.length;
    const estimatedBandwidth = avgArticleSize * totalQueries;
    
    return {
      totalArticles: articles.length,
      avgArticleSize: Math.round(avgArticleSize),
      totalTextSize,
      totalQueries,
      estimatedBandwidthKB: Math.round(estimatedBandwidth / 1024),
      largestArticles: articles
        .filter(a => a.text && a.text.length > 10000)
        .map(a => ({
          id: a._id,
          title: a.title,
          textSize: a.text?.length || 0
        }))
        .sort((a, b) => b.textSize - a.textSize)
        .slice(0, 10)
    };
  },
});

// 🎯 OPTIMIZATION SUGGESTIONS
export const getOptimizationSuggestions = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    
    const suggestions = [];
    
    // Check for oversized articles
    const largeArticles = articles.filter(a => a.text && a.text.length > 20000);
    if (largeArticles.length > 0) {
      suggestions.push({
        type: 'large_articles',
        message: `${largeArticles.length} articles are over 20KB. Consider using pagination or summary views.`,
        impact: 'high'
      });
    }
    
    // Check for articles without content type
    const uncategorizedArticles = articles.filter(a => !a.contentType);
    if (uncategorizedArticles.length > 0) {
      suggestions.push({
        type: 'missing_contentType',
        message: `${uncategorizedArticles.length} articles missing contentType. This affects query efficiency.`,
        impact: 'medium'
      });
    }
    
    // Check total article count
    if (articles.length > 1000) {
      suggestions.push({
        type: 'high_article_count',
        message: `${articles.length} total articles. Consider implementing pagination for better performance.`,
        impact: 'high'
      });
    }
    
    return suggestions;
  },
}); 