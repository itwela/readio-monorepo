import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { EL_SticVoiceId, kokoroString, systemPromptForArticleTitle, systemPromptChooseCategory, systemPromptNSFW, systemPromptForArticleGeneration } from "./constants";

// Article Generation Mutations
import { 
  generateArticleContent, generateAudioElevenLabs, generateAudioReplicate, 
  generateCategory, generateIllustration, generateImagePrompt, 
  generateTitle, checkNSFW, uploadToS3 } from "./articleMutations";

// Type definitions
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
    customVoiceId: v.optional(v.string()),
    serviceProvider: v.optional(v.string()),
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
      // TODO: We need to pass API keys as environment variables instead of through clients object
      // For now, return a simple response to test that the cyclical structure error is fixed
      
      console.log('generateArticleReplicate called with query:', args.query);
      
      return {
        success: true,
        article: {
          id: 'temp_replicate_id',
          title: 'Test Title',
          category: 'Test',
          articleText: 'Test article text',
          isNSFW: false
        },
        remainingGenerations: limit - currentRuns - 1,
      };

      // COMMENTED OUT - Need to refactor to use environment variables for API keys
      // // Instead of using generateArticleMaster mutation, we'll do the generation inline
      // // This avoids the circular reference issue with the clients object

      // // 1. Generate title using external API directly
      // const titleInput = {
      //   top_k: 0,
      //   top_p: 0.95,
      //   temperature: 0.7,
      //   max_new_tokens: 100,
      //   prompt: `Generate a short, rhythmic title using the Lotus Auto-Title Generator style. Here is a preview: ${args.query.substring(0, 100)}.
      //   Prioritize clarity + curiosity. The title should sound like the name of a chapter, short film, or spoken essay.
      //   Make sure it includes the topic or technique when relevant. Never use generic inspiration, clickbait, or vague poetry.
      //   Avoid poetic titles unless they clearly include the subject (person, concept, or metaphor).
      //   
      //   CRITICAL OUTPUT INSTRUCTIONS:
      //   1. Return ONLY the title text
      //   2. NO explanations, NO commentary, NO quotes
      //   3. NO prefixes like "Here's a title..." or "This title..."
      //   4. AGAIN, NO QUOTES!!!!!!!!!!!!!!!!!!! JUST GIVE THE TITLE.`,
      //   system_prompt: systemPromptForArticleTitle,
      // };

      // const titleOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: titleInput });
      // const title = (Array.isArray(titleOutput) ? titleOutput.join("") : String(titleOutput)).trim();

      // // 2. Generate category
      // const categoryInput = {
      //   top_k: 0,
      //   top_p: 0.95,
      //   temperature: 0.7,
      //   max_new_tokens: 50,
      //   stop_sequences: "<|end_of_text|>,<|eot_id|>",
      //   prompt: `Please give me a category for this title: ${title}. Respond with just the category name, no additional text.`,
      //   system_prompt: systemPromptChooseCategory,
      // };

      // const categoryOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: categoryInput });
      // const category = (Array.isArray(categoryOutput) ? categoryOutput.join("") : String(categoryOutput)).trim().replace(/\s+/g, '');

      // // 3. Check NSFW
      // const nsfwInput = {
      //   top_k: 0,
      //   top_p: 0.95,
      //   temperature: 0.7,
      //   max_new_tokens: 50,
      //   stop_sequences: "<|end_of_text|>,<|eot_id|>",
      //   prompt: `Please check this title for NSFW content: "${title}"
      //   CRITICAL OUTPUT INSTRUCTIONS:
      //   1. Return ONLY "NSFW" or "SAFE", no other text
      //   2. NO explanations, NO commentary, NO quotes`,
      //   system_prompt: systemPromptNSFW,
      // };

      // const nsfwOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: nsfwInput });
      // const isNSFW = (Array.isArray(nsfwOutput) ? nsfwOutput.join("") : String(nsfwOutput)).trim() === "NSFW";

      // // 4. Generate article content
      // const contentInput = {
      //   top_k: 0,
      //   top_p: 0.95,
      //   temperature: 0.7,
      //   max_new_tokens: 1500,
      //   stop_sequences: "<|end_of_text|>,<|eot_id|>",
      //   prompt: `The topic is: ${args.query}.
      //   The title is: ${title}.

      //   IMPORTANT INSTRUCTIONS:
      //   1. Use ellipsis (...) for natural pauses
      //   2. No Markdown formatting
      //   3. Return ONLY the article text, no additional text`,
      //   system_prompt: systemPromptForArticleGeneration,
      // };

      // const contentOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: contentInput });
      // const articleText = (Array.isArray(contentOutput) ? contentOutput.join("") : String(contentOutput)).trim();

      // // 5. Create article record first (we'll update with audio/image later)
      // const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
      //   title,
      //   text: articleText,
      //   topic: category,
      //   user_db_id: user.user_db_id,
      //   nsfw: isNSFW,
      // });

      // // Increment user's generation count
      // await ctx.runMutation(api.users.incrementArticleRuns, {
      //   userId: user._id,
      // });
      
      // // Record analytics
      // await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
      //   contentType: 'article_generation',
      //   content_id: undefined,
      //   item_url: `generated_replicate_${Date.now()}`,
      //   event_type: 'play',
      // });

      // return {
      //   success: true,
      //   article: {
      //     id: tempArticleId,
      //     title,
      //     category,
      //     articleText,
      //     isNSFW
      //   },
      //   remainingGenerations: limit - currentRuns - 1,
      // };

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
      // Handle generation inline to avoid circular reference issues

      // 1. Generate title using external API directly
      const titleInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 100,
        // REVIEW - STOP ADDING  MORE HERE. THE INSTRUCTIONS ARE IN THE SYSTEM PROMPT
        prompt: `Here is a preview of what you need to make the title on: ${args.query.substring(0, 100)}.`,
        system_prompt: systemPromptForArticleTitle,
      };

      const titleOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: titleInput });
      const title = (Array.isArray(titleOutput) ? titleOutput.join("") : String(titleOutput)).trim();

      // 2. Generate category
      const categoryInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please give me a category for this title: ${title}. Respond with just the category name, no additional text.`,
        system_prompt: systemPromptChooseCategory,
      };

      const categoryOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: categoryInput });
      const category = (Array.isArray(categoryOutput) ? categoryOutput.join("") : String(categoryOutput)).trim().replace(/\s+/g, '');

      // 3. Check NSFW
      const nsfwInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please check this title for NSFW content: "${title}"
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY "NSFW" or "SAFE", no other text
        2. NO explanations, NO commentary, NO quotes`,
        system_prompt: systemPromptNSFW,
      };

      const nsfwOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: nsfwInput });
      const isNSFW = (Array.isArray(nsfwOutput) ? nsfwOutput.join("") : String(nsfwOutput)).trim() === "NSFW";

      // 4. Generate article content
      const contentInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 1500,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `The topic is: ${args.query}.
        The title is: ${title}.

        IMPORTANT INSTRUCTIONS:
        1. Use ellipsis (...) for natural pauses
        2. No Markdown formatting
        3. Return ONLY the article text, no additional text`,
        system_prompt: systemPromptForArticleGeneration,
      };

      const contentOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: contentInput });
      const articleText = (Array.isArray(contentOutput) ? contentOutput.join("") : String(contentOutput)).trim();

      // 5. Generate audio using ElevenLabs directly
      const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
      const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': args.apiKey,
      };

      const requestBody = {
        text: articleText,
        voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.95 },
        model_id: user.user_role === "admin" ? "eleven_multilingual_v2" : "eleven_flash_v2"
      };

      const audioResponse = await fetch(`${baseUrl}/${EL_SticVoiceId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!audioResponse.ok) {
        const error = await audioResponse.text();
        throw new Error(`ElevenLabs API Error: ${audioResponse.status} ${error}`);
      }

      const audioData = await audioResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioData).toString('base64');
      const wordCount = articleText.split(/\s+/).length;
      const durationSeconds = Math.ceil(wordCount / 4);

      // 6. Create article record
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: articleText,
        topic: category,
        user_db_id: user.user_db_id,
        nsfw: isNSFW,
        duration: durationSeconds,
      });

      // Update user's voice usage
      await ctx.runMutation(api.users.updateVoiceUsage, {
        userId: user._id,
        duration: durationSeconds
      });

      await ctx.runMutation(api.users.incrementArticleRuns, {
        userId: user._id,
      });

      await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
        contentType: 'article',
        content_id: undefined,
        item_url: `generated_elevenlabs_${Date.now()}`,
        event_type: 'play',
      });

      return {
        success: true,
        article: {
          id: tempArticleId,
          title,
          category,
          articleText,
          audioData: base64Audio,
          duration: durationSeconds,
          isNSFW
        },
        remainingGenerations: limit - currentRuns - 1,
      };

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
    customVoiceId: v.optional(v.string()),
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
      console.log('Starting custom article generation...');

      // 1. Fetch API keys from database
      const replicateApiKeyRecord = await ctx.runQuery(api.envVariables.getEnvVariableByKey, {
        key: "EXPO_PUBLIC_REPLICATE_API_TOKEN"
      });
      
      if (!replicateApiKeyRecord) {
        console.log('Missing REPLICATE_API_TOKEN in database - using fallback');
        // Use a simple generated title for now
        const title = `${args.query.substring(0, 50)}...`;
        
        // Create article with minimal data for testing
        const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
          title,
          text: args.query,
          topic: 'D.I.Y',
          user_db_id: user.user_db_id,
          nsfw: false,
        });

        await ctx.runMutation(api.users.incrementArticleRuns, {
          userId: user._id,
        });

        return {
          success: true,
          article: {
            id: tempArticleId,
            title,
            query: args.query,
          },
          remainingGenerations: limit - currentRuns - 1,
        };
      }

      const replicateApiKey = replicateApiKeyRecord.value;
      console.log('Found Replicate API key in database');

      // 2. Generate title using Replicate API
      const titleInput = {
        input: {
          top_k: 0,
          top_p: 0.95,
          temperature: 0.7,
          max_tokens: 100,
          // REVIEW - STOP ADDING  MORE HERE. THE INSTRUCTIONS ARE IN THE SYSTEM PROMPT
          prompt: `Here is a preview of what you need to make the title on: ${args.query.substring(0, 100)}.`,
          system_prompt: systemPromptForArticleTitle,
          stop_sequences: "<|end_of_text|>,<|eot_id|>",
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
          presence_penalty: 0,
          length_penalty: 1,
          log_performance_metrics: false
        }
      };

      console.log('Calling Replicate API for title generation...');
      
      const titleResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateApiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify(titleInput)
      });

      if (!titleResponse.ok) {
        throw new Error(`Replicate API error: ${titleResponse.status} ${await titleResponse.text()}`);
      }

      const titleResult = await titleResponse.json();
      console.log('Title generation result:', titleResult);
      
      // Extract the actual title from the result
      let title = `${args.query.substring(0, 40)}`; // fallback 
      if ((titleResult.status === 'succeeded' || titleResult.status === 'processing') && titleResult.output) {
        const rawTitle = Array.isArray(titleResult.output) 
          ? titleResult.output.join('').trim() 
          : String(titleResult.output).trim();
        
        // Clean up the title (remove quotes, extra spaces, etc.)
        title = rawTitle.replace(/^["']|["']$/g, '').trim() || title;
        console.log('Generated title:', title);
      } else if (titleResult.status === 'failed') {
        console.error('Title generation failed:', titleResult.error);
        // Use fallback title
      } else {
        console.warn('Unexpected response status:', titleResult.status);
        // Use fallback title
      }

      // 3. Generate proper article content (not just the raw query)
      const contentInput = {
        input: {
          top_k: 0,
          top_p: 0.95,
          temperature: 0.7,
          max_tokens: 1500,
          prompt: `The topic is: ${args.query}.
          The title is: ${title}.

          IMPORTANT INSTRUCTIONS:
          1. Use ellipsis (...) for natural pauses
          2. No Markdown formatting
          3. Return ONLY the article text, no additional text`,
          system_prompt: systemPromptForArticleGeneration,
          stop_sequences: "<|end_of_text|>,<|eot_id|>",
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
          presence_penalty: 0,
          length_penalty: 1,
          log_performance_metrics: false
        }
      };

      console.log('Generating article content...');
      const contentResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateApiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify(contentInput)
      });

      if (!contentResponse.ok) {
        throw new Error(`Content generation error: ${contentResponse.status} ${await contentResponse.text()}`);
      }

      const contentResult = await contentResponse.json();
      let articleText = args.query; // fallback
      if ((contentResult.status === 'succeeded' || contentResult.status === 'processing') && contentResult.output) {
        const rawContent = Array.isArray(contentResult.output) 
          ? contentResult.output.join('').trim() 
          : String(contentResult.output).trim();
        articleText = rawContent || articleText;
        console.log('Generated article content length:', articleText.length);
      }

      // 4. Category is D.I.Y
      let category = 'D.I.Y'; // SINCE THIS IS A CUSTOM ARTICLE, IT IS DIY

      // 5. Check NSFW status
      const nsfwInput = {
        input: {
          top_k: 0,
          top_p: 0.95,
          temperature: 0.7,
          max_tokens: 50,
          prompt: `Please check this title for NSFW content: "${title}"
          CRITICAL OUTPUT INSTRUCTIONS:
          1. Return ONLY "NSFW" or "SAFE", no other text
          2. NO explanations, NO commentary, NO quotes`,
          system_prompt: systemPromptNSFW,
          stop_sequences: "<|end_of_text|>,<|eot_id|>",
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
          presence_penalty: 0,
          length_penalty: 1,
          log_performance_metrics: false
        }
      };

      const nsfwResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateApiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify(nsfwInput)
      });

      let isNSFW = false;
      if (nsfwResponse.ok) {
        const nsfwResult = await nsfwResponse.json();
        if ((nsfwResult.status === 'succeeded' || nsfwResult.status === 'processing') && nsfwResult.output) {
          const rawNsfw = Array.isArray(nsfwResult.output) 
            ? nsfwResult.output.join('').trim() 
            : String(nsfwResult.output).trim();
          isNSFW = rawNsfw === "NSFW";
          console.log('NSFW check result:', isNSFW);
        }
      }

      // TODO

      // 6. Create complete article with proper structure
      console.log('Creating complete article...');
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: articleText,
        topic: category,
        user_db_id: user.user_db_id,
        nsfw: isNSFW,
        favorited: false,
        featured: false,
        upvotes: 0,
        tag: 'user_generated',
        artist: user.name || 'Unknown User',
        contentType: 'article',
        // Note: URL will be updated later when audio is generated and uploaded
      });

      await ctx.runMutation(api.users.incrementArticleRuns, {
        userId: user._id,
      });

      await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
        contentType: 'article',
        content_id: tempArticleId,
        item_url: `generated_custom_replicate_${Date.now()}`,
        event_type: 'play',
      });

      console.log('✅ Successfully created complete article with ID:', tempArticleId);

      // 7. Generate audio using Replicate Kokoro TTS
      console.log('Generating audio for article...');
      const audioInput = {
        version: "kjjk10/kokoro-82m:882bc45ec70c819feeb972cb70af760fcfd67125bb66130e7b478e95bbd275d5",
        input: {
          text: articleText,
          voice: args.customVoiceId || "af_bella" // Use custom voice if provided, fallback to af_bella
        }
      };

      const audioResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateApiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait', // Wait for completion
        },
        body: JSON.stringify(audioInput)
      });

      let audioUrl = null;
      if (audioResponse.ok) {
        const audioResult = await audioResponse.json();
        console.log('Audio generation result:', audioResult);
        
        if (audioResult.status === 'succeeded' && audioResult.output) {
          audioUrl = audioResult.output; // Should be the direct audio file URL
          console.log('Generated audio URL:', audioUrl);
          
          // Update the article with the audio URL
          await ctx.runMutation(api.articles.updateArticleUrl, {
            articleId: tempArticleId,
            url: audioUrl
          });
          
          console.log('✅ Updated article with audio URL');
        } else if (audioResult.status === 'failed') {
          console.error('Audio generation failed:', audioResult.error);
        } else {
          console.warn('Audio generation incomplete, status:', audioResult.status);
        }
      } else {
        console.error('Audio API request failed:', await audioResponse.text());
      }

      // 8. Fetch the complete article from database to ensure we have all fields
      const completeArticle = await ctx.runQuery(api.articles.getArticleById, {
        articleId: tempArticleId
      });

      return {
        success: true,
        article: completeArticle ? {
          ...completeArticle,
          // Ensure we have the required fields for TrackPlayer
          id: completeArticle._id,
          // Include debug info
          replicateResponse: {
            titleStatus: titleResult.status,
            contentGenerated: articleText.length > args.query.length
          }
        } : {
          // Fallback if query fails
          id: tempArticleId,
          title,
          text: articleText,
          topic: category,
          nsfw: isNSFW,
          artist: user.name || 'Unknown User',
          user_db_id: user.user_db_id,
          favorited: false,
          featured: false,
          upvotes: 0,
          replicateResponse: {
            titleStatus: titleResult.status,
            contentGenerated: articleText.length > args.query.length
          }
        },
        remainingGenerations: limit - currentRuns - 1,
      };

    } catch (error: any) {
      console.error('Custom article generation failed:', error);
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
      // Handle custom ElevenLabs generation inline

      // 1. Generate title from query
      const titleInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 100,
        // REVIEW - STOP ADDING  MORE HERE. THE INSTRUCTIONS ARE IN THE SYSTEM PROMPT
        prompt: `Here is a preview of what you need to make the title on: ${args.query.substring(0, 100)}.`,
        system_prompt: systemPromptForArticleTitle,
      };

      const titleOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: titleInput });
      const title = (Array.isArray(titleOutput) ? titleOutput.join("") : String(titleOutput)).trim();

      // 2. Check NSFW
      const nsfwInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please check this title for NSFW content: "${title}"
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY "NSFW" or "SAFE", no other text
        2. NO explanations, NO commentary, NO quotes`,
        system_prompt: systemPromptNSFW,
      };

      const nsfwOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: nsfwInput });
      const isNSFW = (Array.isArray(nsfwOutput) ? nsfwOutput.join("") : String(nsfwOutput)).trim() === "NSFW";

      // 3. Generate audio using ElevenLabs directly
      const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
      const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': args.apiKey,
      };

      const requestBody = {
        text: args.query,
        voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.95 },
        model_id: user.user_role === "admin" ? "eleven_multilingual_v2" : "eleven_flash_v2"
      };

      const audioResponse = await fetch(`${baseUrl}/${EL_SticVoiceId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!audioResponse.ok) {
        const error = await audioResponse.text();
        throw new Error(`ElevenLabs API Error: ${audioResponse.status} ${error}`);
      }

      const audioData = await audioResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioData).toString('base64');
      const wordCount = args.query.split(/\s+/).length;
      const durationSeconds = Math.ceil(wordCount / 4);

      // 4. Generate image prompt
      const imagePromptInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 2000,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${title}"
        And a preview: "${args.query.substring(0, 100)}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
      };

      const imagePromptOutput = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input: imagePromptInput });
      const imagePrompt = (Array.isArray(imagePromptOutput) ? imagePromptOutput.join("") : String(imagePromptOutput)).trim();

      // 5. Generate illustration
      const illustrationOutput = await args.clients.replicateClient.run("luma/photon-flash", {
        input: { prompt: imagePrompt }
      });

      let imageUrl = '';
      if (illustrationOutput && typeof illustrationOutput === 'object' && typeof (illustrationOutput as any).url === 'function') {
        imageUrl = await (illustrationOutput as any).url();
      }

      // 6. Create article
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: args.query,
        artwork: imageUrl,
        topic: 'D.I.Y',
        user_db_id: user.user_db_id,
        nsfw: isNSFW,
        duration: durationSeconds,
      });

      // Update user's voice usage
      await ctx.runMutation(api.users.updateVoiceUsage, {
        userId: user._id,
        duration: durationSeconds
      });

      await ctx.runMutation(api.users.incrementArticleRuns, {
        userId: user._id,
      });

      await ctx.runMutation(api.contentAnalytics.recordPlayEvent, {
        contentType: 'article',
        content_id: tempArticleId,
        item_url: `generated_custom_elevenlabs_${Date.now()}`,
        event_type: 'play',
      });

      return {
        success: true,
        article: {
          id: tempArticleId,
          title,
          audioData: base64Audio,
          imageUrl: imageUrl,
          duration: durationSeconds,
        },
        remainingGenerations: limit - currentRuns - 1,
      };

    } catch (error: any) {
      console.error('Custom ElevenLabs article generation failed:', error);
      throw new Error(`Custom article generation failed: ${error.message}`);
    }
  },
});

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
