import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { EL_SticVoiceId } from "../handleArticleGenerations/generationUtilities";

// Article Generation Mutations
import { 
  generateArticleContent, generateAudioElevenLabs, generateAudioReplicate, 
  generateCategory, generateIllustration, generateImagePrompt, 
  generateTitle, checkNSFW, uploadToS3 } from "./articleMutations";

// Type definitions
interface GenerationResult {
  success: boolean;
  theArticle?: any;
  error?: string;
}

interface User {
  _id: any;
  user_db_id?: string;
  name?: string;
  email?: string;
  user_role?: string;
  article_generation_runs?: number;
  article_generation_runs_limit?: number;
  subscription_plan?: string;
  article_runs_last_reset_at?: string;
  stic_voice_usage_seconds?: number;
}

interface MutationResult {
  success: boolean;
  result?: any;
  error?: string;
}

// REVIEW -Generate article using Replicate (server-side action) CONVEX
export const generateArticleReplicate = action({
  args: {
    user_db_id: v.string(),
    query: v.string(),
    form_id: v.optional(v.string()),
    clients: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
  }> => {
    // Check user limits and permissions
    const user: User | null = await ctx.runQuery(api.users.getUserByDbId, {
      user_db_id: args.user_db_id
    });
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user has reached generation limit
    const currentRuns: number = user.article_generation_runs || 0;
    const limit: number = user.article_generation_runs_limit || 0;
    if (currentRuns >= limit) {
      throw new Error("Article generation limit reached. Please upgrade your plan.");
    }

    try {
      // Use the generateArticleMaster mutation with Replicate
      const result = await ctx.runMutation(api.articleGeneration.generateArticleMaster, {
        query: args.query,
        user: user,
        clients: args.clients,
        serviceProvider: "replicate",
      });

      if (result.success && result.result) {
        // Increment user's generation count
        await ctx.runMutation(api.users.incrementArticleRuns, {
          userId: user._id,
        });
        
        // Record analytics
        await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
          content_type: 'article_generation',
          content_id: undefined,
          item_url: `generated_replicate_${Date.now()}`,
          event_type: 'play',
        });

        return {
          success: true,
          article: result.result,
          remainingGenerations: limit - currentRuns - 1,
        };
      } else {
        throw new Error(result.error || "Article generation failed");
      }

    } catch (error: any) {
      console.error('Article generation failed:', error);
      throw new Error(`Article generation failed: ${error.message}`);
    }
  },
});

// REVIEW Generate article using ElevenLabs (server-side action) CONVEX
export const generateArticleElevenLabs = action({
  args: {
    user_db_id: v.string(),
    query: v.string(),
    form_id: v.optional(v.string()),
    clients: v.optional(v.any()),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
  }> => {
    const user: User | null = await ctx.runQuery(api.users.getUserByDbId, {
      user_db_id: args.user_db_id
    });
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentRuns: number = user.article_generation_runs || 0;
    const limit: number = user.article_generation_runs_limit || 0;
    if (currentRuns >= limit) {
      throw new Error("Article generation limit reached. Please upgrade your plan.");
    }

    try {
      // Use the generateArticleMaster mutation with ElevenLabs
      const result = await ctx.runMutation(api.articleGeneration.generateArticleMaster, {
        query: args.query,
        user: user,
        clients: args.clients,
        apiKey: args.apiKey,
        serviceProvider: "elevenlabs",
      });

      if (result.success && result.result) {
        await ctx.runMutation(api.users.incrementArticleRuns, {
          userId: user._id,
        });

        await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
          content_type: 'article_generation',
          content_id: undefined,
          item_url: `generated_elevenlabs_${Date.now()}`,
          event_type: 'play',
        });

        return {
          success: true,
          article: result.result,
          remainingGenerations: limit - currentRuns - 1,
        };
      } else {
        throw new Error(result.error || "Article generation failed");
      }

    } catch (error: any) {
      console.error('ElevenLabs article generation failed:', error);
      throw new Error(`Article generation failed: ${error.message}`);
    }
  },
});

// Generate custom article using Replicate (server-side action)
export const generateArticleReplicateCustom = action({
  args: {
    user_db_id: v.string(),
    query: v.string(),
    form_id: v.optional(v.string()),
    clients: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
  }> => {
    const user: User | null = await ctx.runQuery(api.users.getUserByDbId, {
      user_db_id: args.user_db_id
    });
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentRuns: number = user.article_generation_runs || 0;
    const limit: number = user.article_generation_runs_limit || 0;
    if (currentRuns >= limit) {
      throw new Error("Article generation limit reached. Please upgrade your plan.");
    }

    try {
      // Use handleGenerateArticleReplicateCustomConvex for custom generation
      const result: GenerationResult = await generateCustomArticleMasterReplicate({
        form: {
          query: args.query,
          id: args.form_id || `convex_${Date.now()}`
        },
        user,
        clients: args.clients,
        ctx
      });

      if (result.success && result.theArticle) {
        await ctx.runMutation(api.users.incrementArticleRuns, {
          userId: user._id,
        });

        await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
          content_type: 'article_generation_custom',
          content_id: undefined,
          item_url: `generated_custom_replicate_${Date.now()}`,
          event_type: 'play',
        });

        return {
          success: true,
          article: result.theArticle,
          remainingGenerations: limit - currentRuns - 1,
        };
      } else {
        throw new Error(result.error || "Custom article generation failed");
      }

    } catch (error: any) {
      console.error('Custom Replicate article generation failed:', error);
      throw new Error(`Custom article generation failed: ${error.message}`);
    }
  },
});

// Generate custom article using ElevenLabs (server-side action)
export const generateArticleElevenLabsCustom = action({
  args: {
    user_db_id: v.string(),
    query: v.string(),
    form_id: v.optional(v.string()),
    clients: v.optional(v.any()),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
  }> => {
    const user: User | null = await ctx.runQuery(api.users.getUserByDbId, {
      user_db_id: args.user_db_id
    });
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentRuns: number = user.article_generation_runs || 0;
    const limit: number = user.article_generation_runs_limit || 0;
    if (currentRuns >= limit) {
      throw new Error("Article generation limit reached. Please upgrade your plan.");
    }

    try {
      // Use handleGenerateArticleElevenLabsCustomConvex for custom generation
      const result: GenerationResult = await generateCustomArticleMasterElevenLabs({
        form: {
          query: args.query,
          id: args.form_id || `convex_${Date.now()}`
        },
        user,
        clients: args.clients,
        apiKey: args.apiKey,
        ctx
      });

      if (result.success && result.theArticle) {
        await ctx.runMutation(api.users.incrementArticleRuns, {
          userId: user._id,
        });

        await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
          content_type: 'article_generation_custom',
          content_id: undefined,
          item_url: `generated_custom_elevenlabs_${Date.now()}`,
          event_type: 'play',
        });

        return {
          success: true,
          article: result.theArticle,
          remainingGenerations: limit - currentRuns - 1,
        };
      } else {
        throw new Error(result.error || "Custom ElevenLabs article generation failed");
      }

    } catch (error: any) {
      console.error('Custom ElevenLabs article generation failed:', error);
      throw new Error(`Custom article generation failed: ${error.message}`);
    }
  },
});

/**
 * TODO - Unified master mutation for article generation with optional custom parameters
 */
export const generateArticleMaster = mutation({
  args: {
    query: v.string(),
    user: v.any(),
    clients: v.any(),
    apiKey: v.optional(v.string()),
    serviceProvider: v.union(v.literal("replicate"), v.literal("elevenlabs")),
    customVoiceId: v.optional(v.string()) // Optional custom voice ID override
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      // 1. Generate title
      const titleResult = await ctx.runMutation(api.articleMutations.generateTitle, {
        query: args.query,
        clients: args.clients,
        user: args.user
      });
      if (!titleResult.success) return titleResult;
      const title = titleResult.result.title;

      // 2. Generate category
      const categoryResult = await ctx.runMutation(api.articleMutations.generateCategory, {
        title,
        clients: args.clients
      });
      if (!categoryResult.success) return categoryResult;
      const category = categoryResult.result.category;

      // 3. Check NSFW
      const nsfwResult = await ctx.runMutation(api.articleMutations.checkNSFW, {
        title,
        clients: args.clients
      });
      if (!nsfwResult.success) return nsfwResult;
      const isNSFW = nsfwResult.result.isNSFW;

      // 4. Generate article content
      const contentResult = await ctx.runMutation(api.articleMutations.generateArticleContent, {
        query: args.query,
        title,
        clients: args.clients,
        serviceProvider: args.serviceProvider
      });
      if (!contentResult.success) return contentResult;
      const articleText = contentResult.result.articleText;

      // 5. Generate image prompt
      const imagePromptResult = await ctx.runMutation(api.articleMutations.generateImagePrompt, {
        title,
        articleText,
        clients: args.clients
      });
      if (!imagePromptResult.success) return imagePromptResult;
      const imagePrompt = imagePromptResult.result.prompt;

      // 6. Generate illustration
      const illustrationResult = await ctx.runMutation(api.articleMutations.generateIllustration, {
        prompt: imagePrompt,
        clients: args.clients
      });
      if (!illustrationResult.success) return illustrationResult;
      const illustrationUrl = illustrationResult.result.imageUrl;

      // 7. Generate audio
      let audioResult;
      if (args.serviceProvider === "replicate") {
        audioResult = await ctx.runMutation(api.articleMutations.generateAudioReplicate, {
          text: articleText,
          // FIXME
          voice: "default",
          clients: args.clients
        });
      } else {
        audioResult = await ctx.runMutation(api.articleMutations.generateAudioElevenLabs, {
          text: articleText,
          // TODO CAN MAKE THIS ELEVEN LABS VOICE ID ADAPTABLE LATER
          voiceId: EL_SticVoiceId,
          apiKey: args.apiKey || "",
          userRole: args.user?.user_role || "standard"
        });
      }
      if (!audioResult.success) return audioResult;
      const audioUrl = audioResult.result.audioUrl;

      // 8. Create article record
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: articleText,
        artwork: illustrationUrl,
        topic: category,
        user_db_id: args.user.user_db_id,
        nsfw: isNSFW,
        duration: audioResult.result.duration || 0,
      });

      // 9. Upload audio to S3 and update article
      const uploadResult = await ctx.runMutation(api.articleMutations.uploadToS3, {
        fileType: "audio",
        fileId: `article_${tempArticleId}`,
        fileData: audioUrl,
        clients: args.clients
      });

      if (uploadResult.success) {
        await ctx.runMutation(api.articles.updateArticleUrl, {
          articleId: tempArticleId,
          url: uploadResult.result.url,
        });
      }

      // Update user's voice usage if duration is available
      if (audioResult.result.duration) {
        await ctx.runMutation(api.users.updateVoiceUsage, {
          userId: args.user._id,
          duration: audioResult.result.duration
        });
      }

      return {
        success: true,
        result: {
          id: tempArticleId,
          title,
          category,
          articleText,
          illustrationUrl,
          audioUrl: uploadResult.success ? uploadResult.result.url : audioUrl,
          isNSFW
        }
      };
    } catch (error) {
      console.error("Article generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Article generation failed"
      };
    }
  }
});

// TODO - Helper functions for custom generation (these need proper implementation)
async function generateCustomArticleMasterReplicate(params: {
  form: any;
  user: User;
  clients: any;
  ctx: any;
}): Promise<GenerationResult> {
  try {
    const { form, user, clients, ctx } = params;
    
    // This is a simplified implementation - you'll need to adapt your custom logic here
    // For now, let's use the standard flow but with the raw query as content
    
    // Generate title from query
    const titleResult = await ctx.runMutation(api.articleMutations.generateTitle, {
      query: form.query,
      clients,
      user
    });
    if (!titleResult.success) throw new Error(titleResult.error);
    const title = titleResult.result.title;

    // Check NSFW
    const nsfwResult = await ctx.runMutation(api.articleMutations.checkNSFW, {
      title,
      clients
    });
    const isNSFW = nsfwResult.success ? nsfwResult.result.isNSFW : false;

    // TODO 
    // Generate audio directly from the query (custom behavior)
    const audioResult = await ctx.runMutation(api.articleMutations.generateAudioReplicate, {
      text: form.query,
      // FIXME
      voice: "default",
      clients
    });
    if (!audioResult.success) throw new Error(audioResult.error);

    // Generate image prompt
    const imagePromptResult = await ctx.runMutation(api.articleMutations.generateImagePrompt, {
      title,
      articleText: form.query,
      clients
    });
    if (!imagePromptResult.success) throw new Error(imagePromptResult.error);

    // Generate illustration
    const illustrationResult = await ctx.runMutation(api.articleMutations.generateIllustration, {
      prompt: imagePromptResult.result.prompt,
      clients
    });
    if (!illustrationResult.success) throw new Error(illustrationResult.error);

    // Create article
    const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
      title,
      text: form.query,
      artwork: illustrationResult.result.imageUrl,
      topic: 'D.I.Y',
      user_db_id: user.user_db_id,
      nsfw: isNSFW,
    });

    // Upload audio
    const uploadResult = await ctx.runMutation(api.articleMutations.uploadToS3, {
      fileType: "audio",
      fileId: `custom_article_${tempArticleId}`,
      fileData: audioResult.result.audioUrl,
      clients
    });

    if (uploadResult.success) {
      await ctx.runMutation(api.articles.updateArticleUrl, {
        articleId: tempArticleId,
        url: uploadResult.result.url,
      });
    }

    return {
      success: true,
      theArticle: {
        id: tempArticleId,
        title,
        audioUrl: uploadResult.success ? uploadResult.result.url : audioResult.result.audioUrl,
        imageUrl: illustrationResult.result.imageUrl,
      }
    };
  } catch (error) {
    console.error('❌ Error in handleGenerateArticleReplicateCustomConvex:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// TODO - Helper functions for custom generation (these need proper implementation)
async function generateCustomArticleMasterElevenLabs(params: {
  form: any;
  user: User;
  clients: any;
  apiKey: string;
  ctx: any;
}): Promise<GenerationResult> {
  try {
    const { form, user, clients, apiKey, ctx } = params;
    
    // Generate title from query
    const titleResult = await ctx.runMutation(api.articleMutations.generateTitle, {
      query: form.query,
      clients,
      user
    });
    if (!titleResult.success) throw new Error(titleResult.error);
    const title = titleResult.result.title;

    // Check NSFW
    const nsfwResult = await ctx.runMutation(api.articleMutations.checkNSFW, {
      title,
      clients
    });
    const isNSFW = nsfwResult.success ? nsfwResult.result.isNSFW : false;

    // Generate audio using ElevenLabs
    const audioResult = await ctx.runMutation(api.articleMutations.generateAudioElevenLabs, {
      text: form.query,
      // TODO CAN MAKE THIS ELEVEN LABS VOICE ID ADAPTABLE LATER
      voiceId: EL_SticVoiceId,
      apiKey,
      userRole: user.user_role || 'normie'
    });
    if (!audioResult.success) throw new Error(audioResult.error);

    // Update user's voice usage if duration is available
    if (audioResult.result.duration) {
      await ctx.runMutation(api.users.updateVoiceUsage, {
        userId: user._id,
        duration: audioResult.result.duration
      });
    }

    // Generate image prompt
    const imagePromptResult = await ctx.runMutation(api.articleMutations.generateImagePrompt, {
      title,
      articleText: form.query,
      clients
    });
    if (!imagePromptResult.success) throw new Error(imagePromptResult.error);

    // Generate illustration
    const illustrationResult = await ctx.runMutation(api.articleMutations.generateIllustration, {
      prompt: imagePromptResult.result.prompt,
      clients
    });
    if (!illustrationResult.success) throw new Error(illustrationResult.error);

    // Create article
    const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
      title,
      text: form.query,
      artwork: illustrationResult.result.imageUrl,
      topic: 'D.I.Y',
      user_db_id: user.user_db_id,
      nsfw: isNSFW,
      duration: audioResult.result.duration || 0,
    });

    // Upload audio
    const uploadResult = await ctx.runMutation(api.articleMutations.uploadToS3, {
      fileType: "audio",
      fileId: `custom_elevenlabs_article_${tempArticleId}`,
      fileData: audioResult.result.audioUrl,
      clients
    });

    if (uploadResult.success) {
      await ctx.runMutation(api.articles.updateArticleUrl, {
        articleId: tempArticleId,
        url: uploadResult.result.url,
      });
    }

    return {
      success: true,
      theArticle: {
        id: tempArticleId,
        title,
        audioUrl: uploadResult.success ? uploadResult.result.url : audioResult.result.audioUrl,
        imageUrl: illustrationResult.result.imageUrl,
      }
    };
  } catch (error) {
    console.error('❌ Error in handleGenerateArticleElevenLabsCustomConvex:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Batch generate articles
export const batchGenerateArticles = action({
  args: {
    user_db_id: v.string(),
    queries: v.array(v.string()),
    generation_type: v.union(v.literal("replicate"), v.literal("elevenlabs"), v.literal("replicate_custom"), v.literal("elevenlabs_custom")),
    clients: v.optional(v.any()),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    successful: any[];
    failed: any[];
    totalRequested: number;
    totalSuccessful: number;
    totalFailed: number;
  }> => {
    const user = await ctx.runQuery(api.users.getUserByDbId, {
      user_db_id: args.user_db_id
    });

    if (!user) {
      throw new Error("User not found");
    }

    const currentRuns = user.article_generation_runs || 0;
    const limit = user.article_generation_runs_limit || 0;
    const remainingGenerations = limit - currentRuns;

    if (args.queries.length > remainingGenerations) {
      throw new Error(`Not enough generations remaining. You have ${remainingGenerations} left, but requested ${args.queries.length}`);
    }

    const results = [];
    const errors = [];

    for (const query of args.queries) {
      try {
        let result;
        switch (args.generation_type) {
          case "replicate":
            result = await ctx.runAction(api.articleGeneration.generateArticleReplicate, {
              user_db_id: args.user_db_id,
              query,
              clients: args.clients,
            });
            break;
          case "elevenlabs":
            result = await ctx.runAction(api.articleGeneration.generateArticleElevenLabs, {
              user_db_id: args.user_db_id,
              query,
              clients: args.clients,
              apiKey: args.apiKey,
            });
            break;
          case "replicate_custom":
            result = await ctx.runAction(api.articleGeneration.generateArticleReplicateCustom, {
              user_db_id: args.user_db_id,
              query,
              clients: args.clients,
            });
            break;
          case "elevenlabs_custom":
            result = await ctx.runAction(api.articleGeneration.generateArticleElevenLabsCustom, {
              user_db_id: args.user_db_id,
              query,
              clients: args.clients,
              apiKey: args.apiKey,
            });
            break;
        }
        results.push(result);
      } catch (error: any) {
        errors.push({ query, error: error.message });
      }
    }

    return {
      successful: results,
      failed: errors,
      totalRequested: args.queries.length,
      totalSuccessful: results.length,
      totalFailed: errors.length,
    };
  },
});

// Get user's generation status
export const getGenerationStatus = query({
  args: { user_db_id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const currentRuns = user.article_generation_runs || 0;
    const limit = user.article_generation_runs_limit || 0;
    const lastReset = user.article_runs_last_reset_at;

    return {
      currentGenerations: currentRuns,
      generationLimit: limit,
      remainingGenerations: Math.max(0, limit - currentRuns),
      subscriptionPlan: user.subscription_plan || 'blank',
      lastResetDate: lastReset,
      canGenerate: currentRuns < limit,
    };
  },
});

// Reset user's generation count (admin only)
export const resetUserGenerations = mutation({
  args: {
    user_db_id: v.string(),
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const admin = await ctx.db
      .query("users")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.adminUserId))
      .first();

    if (!admin || admin.user_role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_db_id", (q) => q.eq("user_db_id", args.user_db_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      article_generation_runs: 0,
      article_runs_last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },
});

