import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Replicate from "replicate";
import { Buffer } from "buffer";
import { EL_SticVoiceId, kokoroString, metaLlamaString, systemPromptForArticleTitle, systemPromptChooseCategory, systemPromptNSFW, systemPromptReplicateImageQuery, systemPromptForArticleGeneration } from "./constants";
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { Id } from "./_generated/dataModel";

// Helper function for ElevenLabs HTTP API
async function generateElevenLabsAudio(text: string, voiceId: string, apiKey: string, userRole: string) {
  const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
  const headers = {
    'Content-Type': 'application/json',
    'xi-api-key': apiKey,
  };

  const requestBody = {
    text,
    voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.95 },
    model_id: userRole === "admin" ? "eleven_multilingual_v2" : "eleven_flash_v2"
  };

  try {
    const response = await fetch(`${baseUrl}/${voiceId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API Error: ${response.status} ${errorText}`);
    }

    const audioData = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioData).toString('base64');
    
    // Estimate duration (word count / 4 words per second)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 4);
    
    return {
      audioData: audioBase64,
      duration: estimatedDuration,
      success: true
    };

  } catch (error) {
    console.error('ElevenLabs audio generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown ElevenLabs error"
    };
  }
}

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

// REVIEW - Generate ARTICLE using Replicate (server-side action) CONVEX
export const generateArticleReplicate = action({
  args: {
    user: v.object({
      _id: v.id("users"),
      name: v.string(),
    user_db_id: v.string(),
      article_generation_runs: v.number(),
      article_generation_runs_limit: v.number(),
    }),
    query: v.string(),
    form_id: v.optional(v.string()),
    customVoiceId: v.optional(v.string()),
    serviceProvider: v.optional(v.string()),
    replicateApiKey: v.string(),
    elevenLabsApiKey: v.optional(v.string()),
    awsAccessKey: v.string(),
    awsSecretKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
    error?: string;
    isLimitReached?: boolean;
  }> => {

    
    const multiDbId = `${args.user?.user_db_id}-${Date.now()}`;

    // ----------------------------------------------------------------------------
    
    try {
      console.log('Starting article generation...');
      
      // Validate API key before using it
      if (!args.replicateApiKey || args.replicateApiKey.trim() === '') {
        return {
          success: false,
          error: "Replicate API key is missing or invalid"
        };
      }

      // 1. Initialize Replicate client with passed API key
      const replicateClient = new Replicate({
        auth: args.replicateApiKey,
      });

      // STUB - 1. Generate title using Replicate SDK
      console.log('Calling Replicate SDK for title generation...');
      
      const titleInput = {
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
      };

      const titleResult = await replicateClient.run(metaLlamaString, { input: titleInput });
      console.log('Title generation result:', titleResult);
      
      // Extract the actual title from the SDK result (no status wrapper)
      let title = `${args.query.substring(0, 40)}`; // fallback 
      if (titleResult) {
        const rawTitle = Array.isArray(titleResult) 
          ? titleResult.join('').trim() 
          : String(titleResult).trim();
        
        // Clean up the title (remove quotes, extra spaces, etc.)
        title = rawTitle.replace(/^["']|["']$/g, '').trim() || title;
        console.log('Generated title:', title);
      } else {
        console.warn('No title result received from SDK');
      }

      // STUB - 2. Generate proper article content using SDK
      const contentInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_tokens: 1500,
        prompt: `The topic is: ${args.query}.
        The title is: ${title}.

        IMPORTANT INSTRUCTIONS:
        1. Use ellipsis (...) for natural pauses
        2. No Markdown formatting
        3. Return ONLY the article text, no additional text
        4. YOU CAN NOT USE ANY SYMBOLS OR SPECIAL CHARACTERS IN THE ARTICLE TEXT. THIS WILL BE READ ALOUD BY AI SO IT IS CRITICAL THAT IT IS PURE TEXT AND THE ONLY THINGS THAT YOU CAN USE THAT ARE NOT LITERALLY PURE TEXT ARE:
        PERIODS AND COMMA'S. THIS IS VERY IMPORTANT THAT YOU FOLLOW DIRECTIONS.
        .
        `,
        system_prompt: systemPromptForArticleGeneration,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
        presence_penalty: 0,
        length_penalty: 1,
        log_performance_metrics: false
      };
      
      console.log('Generating article content...');
      const contentResult = await replicateClient.run(metaLlamaString, { input: contentInput });
      
      let articleText = args.query; // fallback
      if (contentResult) {
        const rawContent = Array.isArray(contentResult) 
          ? contentResult.join('').trim() 
          : String(contentResult).trim();
        articleText = rawContent || articleText;
        console.log('Generated article content length:', articleText.length);
      }

      // 3. Category NEEDS TO BE DETERMINED BY AI
      const categoryInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_tokens: 50,
        prompt: `Please determine the category of the article: "${title}"
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the category, no other text
        2. NO explanations, NO commentary, NO quotes`,
        system_prompt: systemPromptChooseCategory,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
      };  
      const categoryResult = await replicateClient.run(metaLlamaString, { input: categoryInput });
      let category = ''; // fallback
      if (categoryResult) {
        const rawCategory = Array.isArray(categoryResult) 
          ? categoryResult.join('').trim() 
          : String(categoryResult).trim();
        category = rawCategory || category;
        console.log('Generated category:', category);
      }

      // STUB - 4. Check NSFW status using SDK
      const nsfwInput = {
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
      };
      
      const nsfwResult = await replicateClient.run(metaLlamaString, { input: nsfwInput });
      let isNSFW = false;
      if (nsfwResult) {
        const rawNsfw = Array.isArray(nsfwResult) 
          ? nsfwResult.join('').trim() 
          : String(nsfwResult).trim();
        isNSFW = rawNsfw === "NSFW";
        console.log('NSFW check result:', isNSFW);
      }

      // STUB - 5. Generate audio using Replicate SDK and upload to S3
      console.log('Generating audio for article using Replicate SDK...');
      
      let audioUrl = null;
      let imageUrl = null;
      
      const s3Client = new S3({
        region: 'us-east-2',
        credentials: {
          accessKeyId: args.awsAccessKey,
          secretAccessKey: args.awsSecretKey,
        },
      });

      // STUB - 6. Generate Audio
      console.log('🎵 Generating audio...');
      const audioInput = {
        text: articleText,
        voice: args.customVoiceId || "af_kore",
        speed: 0.88,
      };

      console.log('🎯 Using voice:', audioInput.voice);
      console.log('🎯 Audio text length:', articleText.length);

      const audioResponse = await replicateClient.run(kokoroString, { input: audioInput });

      if (audioResponse) {
        const tempAudioUrl = audioResponse.toString();
        console.log('Generated temp audio URL:', tempAudioUrl);
        
        // Download and upload audio to S3
        const audioFetch = await fetch(tempAudioUrl);
        if (audioFetch.ok) {
          const audioBuffer = await audioFetch.arrayBuffer();
          const audioS3Key = `${multiDbId}.mp3`;
          
          await s3Client.send(new PutObjectCommand({
            Bucket: "readio-audio-files",
            Key: audioS3Key,
            Body: Buffer.from(audioBuffer),
            ContentType: 'audio/mpeg',
          }));

          audioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${audioS3Key}`;
          console.log('✅ Audio uploaded to S3:', audioUrl);
        }
      }

      console.log('🎨 Generating image...');
      
      // STUB - 7. First, generate image prompt using LLaMA SDK
      const imagePromptInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_tokens: 500,
        prompt: `Create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${title}"
        And a preview: "${articleText.substring(0, 200)}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
        system_prompt: systemPromptReplicateImageQuery,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
        presence_penalty: 0,
        length_penalty: 1,
        log_performance_metrics: false
      };

      const imagePromptResult = await replicateClient.run(metaLlamaString, { input: imagePromptInput });

      let imagePrompt = `A thoughtful, cinematic scene representing the concept: ${title}`;
      if (imagePromptResult) {
        const rawPrompt = Array.isArray(imagePromptResult) 
          ? imagePromptResult.join('').trim() 
          : String(imagePromptResult).trim();
        imagePrompt = rawPrompt || imagePrompt;
        console.log('Generated image prompt:', imagePrompt);
      }

      // STUB - 8. Generate image with Photon
      console.log('🎨 Generating image with prompt:', imagePrompt.substring(0, 100) + '...');
      const imageResponse = await replicateClient.run("luma/photon-flash", {
        input: { prompt: imagePrompt }
      });

      if (imageResponse) {
        let tempImageUrl = '';
        
        // Handle different response formats from Photon
        if (typeof imageResponse === 'string') {
          tempImageUrl = imageResponse;
        } else if (Array.isArray(imageResponse) && imageResponse.length > 0) {
          tempImageUrl = imageResponse[0];
        } else if (typeof imageResponse === 'object' && imageResponse !== null && 'url' in imageResponse) {
          // Photon returns an object with a url() function that needs to be called
          try {
            const urlFunction = (imageResponse as any).url;
            if (typeof urlFunction === 'function') {
              tempImageUrl = await urlFunction();
            } else {
              tempImageUrl = (imageResponse as any).url;
            }
          } catch (urlError) {
            console.error('Error getting URL from Photon response:', urlError);
            tempImageUrl = String(imageResponse);
          }
        } else {
          // Fallback: try to convert to string
          tempImageUrl = String(imageResponse);
        }

        if (tempImageUrl && typeof tempImageUrl === 'string' && tempImageUrl.startsWith('http')) {
          console.log('Generated temp image URL:', tempImageUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(tempImageUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else if (tempImageUrl && typeof tempImageUrl === 'object' && (tempImageUrl as any).href) {
          // Handle URL object - extract href
          const actualUrl = (tempImageUrl as any).href;
          console.log('Generated temp image URL (from URL object):', actualUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(actualUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else {
          console.warn('Invalid image URL received:', tempImageUrl);
        }
      }

      // NOW WE SHOULD HAVE ALL THE URLS WE NEED TO CREATE THE ARTICLE

      // STUB - 9. CREATE THE ARTICLE
      const wordCount = articleText.split(/\s+/).length;
      const estimatedDuration = Math.ceil(wordCount / 4);

      console.log('✅ Updated article with all media URLs');

      console.log('Creating complete article...');
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: articleText,
        topic: category,
        url: audioUrl as string,
        artwork: imageUrl as string,
        user_db_id: args.user?.user_db_id,
        nsfw: isNSFW,
        favorited: false,
        featured: false,
        upvotes: 0,
        tag: 'user_generated',
        artist: args.user?.name || 'Unknown User',
        contentType: 'article',
        duration: estimatedDuration,
      });
      await ctx.runMutation(api.users.incrementArticleRuns, {
        userId: args.user?._id as Id<"users">,
      });
      await ctx.runMutation(api.contentAnalytics.recordTrackingToken, {
        contentType: 'article',
        content_id: tempArticleId,
        item_url: `generated_replicate_${Date.now()}`,
        token_type: 'play_token',
      });
      console.log('✅ Successfully created complete article with ID:', tempArticleId);

      return {
        success: true,
      };

    } catch (error: any) {
      console.error('Article generation failed:', error);
      return {
        success: false,
        error: `Article generation failed: ${error.message || 'Unknown error'}`
      };
    }
    
  },
});

// REVIEW Generate ARTICLE using ElevenLabs (server-side action) CONVEX
export const generateArticleElevenLabs = action({
  args: {
    user: v.object({
      _id: v.id("users"),
      name: v.string(),
    user_db_id: v.string(),
      article_generation_runs: v.number(),
      article_generation_runs_limit: v.number(),
      user_role: v.string(),
      stic_voice_usage_seconds: v.number(),
      article_runs_last_reset_at: v.string(),
    }),
    query: v.string(),
    form_id: v.optional(v.string()),
    clients: v.optional(v.any()),
    customVoiceId: v.optional(v.string()),
    replicateApiKey: v.string(),
    elevenLabsApiKey: v.string(),
    awsAccessKey: v.string(),
    awsSecretKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
    error?: string;
    isLimitReached?: boolean;
  }> => {

    const multiDbId = `${args.user?.user_db_id}-${Date.now()}`;

    // ----------------------------------------------------------------------------

    try {
      console.log('Starting article generation with ElevenLabs...');

      // Validate API keys before using them
      if (!args.replicateApiKey || args.replicateApiKey.trim() === '') {
        return {
          success: false,
          error: "Replicate API key is missing or invalid"
        };
      }

      if (!args.elevenLabsApiKey || args.elevenLabsApiKey.trim() === '') {
        return {
          success: false,
          error: "ElevenLabs API key is missing or invalid"
        };
      }

    // 1. Initialize Replicate client with passed API key
    const replicateClient = new Replicate({
      auth: args.replicateApiKey,
    });

    // 2. Generate title using Replicate SDK
    console.log('Calling Replicate SDK for title generation...');
    
      const titleInput = {
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
    };

    const titleResult = await replicateClient.run(metaLlamaString, { input: titleInput });
      console.log('Title generation result:', titleResult);
      
    // Extract the actual title from the SDK result (no status wrapper)
      let title = `${args.query.substring(0, 40)}`; // fallback 
    if (titleResult) {
      const rawTitle = Array.isArray(titleResult) 
        ? titleResult.join('').trim() 
        : String(titleResult).trim();
        
        // Clean up the title (remove quotes, extra spaces, etc.)
        title = rawTitle.replace(/^["']|["']$/g, '').trim() || title;
        console.log('Generated title:', title);
      } else {
      console.warn('No title result received from SDK');
      }

    // 3. Generate proper article content using SDK
      const contentInput = {
          top_k: 0,
          top_p: 0.95,
          temperature: 0.7,
          max_tokens: 1500,
          prompt: `The topic is: ${args.query}.
          The title is: ${title}.

          IMPORTANT INSTRUCTIONS:
          1. Use ellipsis (...) for natural pauses
          2. No Markdown formatting
      3. Return ONLY the article text, no additional text
      4. YOU CAN NOT USE ANY SYMBOLS OR SPECIAL CHARACTERS IN THE ARTICLE TEXT. THIS WILL BE READ ALOUD BY AI SO IT IS CRITICAL THAT IT IS PURE TEXT AND THE ONLY THINGS THAT YOU CAN USE THAT ARE NOT LITERALLY PURE TEXT ARE:
      PERIODS AND COMMA'S. THIS IS VERY IMPORTANT THAT YOU FOLLOW DIRECTIONS.
      `,
          system_prompt: systemPromptForArticleGeneration,
          stop_sequences: "<|end_of_text|>,<|eot_id|>",
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
          presence_penalty: 0,
          length_penalty: 1,
          log_performance_metrics: false
      };

      console.log('Generating article content...');
    const contentResult = await replicateClient.run(metaLlamaString, { input: contentInput });
    
      let articleText = args.query; // fallback
    if (contentResult) {
      const rawContent = Array.isArray(contentResult) 
        ? contentResult.join('').trim() 
        : String(contentResult).trim();
        articleText = rawContent || articleText;
        console.log('Generated article content length:', articleText.length);
      }

    // 4. Category NEEDS TO BE DETERMINED BY AI
    const categoryInput = {
      top_k: 0,
      top_p: 0.95,
      temperature: 0.7,
      max_tokens: 50,
      prompt: `Please determine the category of the article: "${title}"
      CRITICAL OUTPUT INSTRUCTIONS:
      1. Return ONLY the category, no other text
      2. NO explanations, NO commentary, NO quotes`,
      system_prompt: systemPromptChooseCategory,
      stop_sequences: "<|end_of_text|>,<|eot_id|>",
      prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
    };  
    const categoryResult = await replicateClient.run(metaLlamaString, { input: categoryInput });
    let category = ''; // fallback
    if (categoryResult) {
      const rawCategory = Array.isArray(categoryResult) 
        ? categoryResult.join('').trim() 
        : String(categoryResult).trim();
      category = rawCategory || category;
      console.log('Generated category:', category);
    }

    // 5. Check NSFW status using SDK
      const nsfwInput = {
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
    };
    
    const nsfwResult = await replicateClient.run(metaLlamaString, { input: nsfwInput });
      let isNSFW = false;
    if (nsfwResult) {
      const rawNsfw = Array.isArray(nsfwResult) 
        ? nsfwResult.join('').trim() 
        : String(nsfwResult).trim();
          isNSFW = rawNsfw === "NSFW";
          console.log('NSFW check result:', isNSFW);
        }

    
    let audioUrl = null;
    let imageUrl = null;
    
    const s3Client = new S3({
      region: 'us-east-2',
      credentials: {
        accessKeyId: args.awsAccessKey,
        secretAccessKey: args.awsSecretKey,
      },
    });

    // STUB - 6. Generate audio using ElevenLabs HTTP API (like your existing approach)
    console.log('Generating audio with ElevenLabs HTTP API...');

    const audioResult = await generateElevenLabsAudio(
      articleText, 
      EL_SticVoiceId, 
      args.elevenLabsApiKey as string, 
      args.user?.user_role || 'normie'
    );

    if (!audioResult.success) {
      return {
        success: false,
        error: `Audio generation failed: ${audioResult.error}`
      };
    }

    const base64Audio = audioResult.audioData;
    const durationSeconds = audioResult.duration || 0;

    // Upload audio to S3 to get proper URL
    try {
      if (!base64Audio) {
        return {
          success: false,
          error: 'No audio data available for upload'
        };
      }

      const s3Client = new S3({
        region: 'us-east-2',
        credentials: {
          accessKeyId: args.awsAccessKey,
          secretAccessKey: args.awsSecretKey,
        },
      });

      // Convert base64 to buffer and upload to S3
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      const audioS3Key = `${Date.now()}_elevenlabs.mp3`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: "readio-audio-files",
        Key: audioS3Key,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
      }));

      audioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${audioS3Key}`;
      console.log('✅ Audio uploaded to S3:', audioUrl);
    } catch (uploadError) {
      console.error('❌ Failed to upload audio to S3:', uploadError);
      // Continue without S3 upload - article will be created without audio URL
      }

      // TODO
    // FIXME
    // NOTE STEP 7: Generate Image
    console.log('🎨 Generating image...');
    
    // First, generate image prompt using LLaMA SDK
    const imagePromptInput = {
      top_k: 0,
      top_p: 0.95,
      temperature: 0.7,
      max_tokens: 500,
      prompt: `Create a detailed image prompt for Replicate's Photon model.
      The content is an article titled: "${title}"
      And a preview: "${articleText.substring(0, 200)}"
      
      CRITICAL OUTPUT INSTRUCTIONS:
      1. Return ONLY the image prompt, no additional text.
      2. NO explanations, NO commentary, NO quotes
      3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
      system_prompt: systemPromptReplicateImageQuery,
      stop_sequences: "<|end_of_text|>,<|eot_id|>",
      prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
      presence_penalty: 0,
      length_penalty: 1,
      log_performance_metrics: false
    };

    const imagePromptResult = await replicateClient.run(metaLlamaString, { input: imagePromptInput });

    let imagePrompt = `A thoughtful, cinematic scene representing the concept: ${title}`;
    if (imagePromptResult) {
      const rawPrompt = Array.isArray(imagePromptResult) 
        ? imagePromptResult.join('').trim() 
        : String(imagePromptResult).trim();
      imagePrompt = rawPrompt || imagePrompt;
      console.log('Generated image prompt:', imagePrompt);
    }

    // STUB - 8. Generate image with Photon
    console.log('🎨 Generating image with prompt:', imagePrompt.substring(0, 100) + '...');
    const imageResponse = await replicateClient.run("luma/photon-flash", {
      input: { prompt: imagePrompt }
    });

    if (imageResponse) {
      let tempImageUrl = '';
      
      // Handle different response formats from Photon
      if (typeof imageResponse === 'string') {
        tempImageUrl = imageResponse;
      } else if (Array.isArray(imageResponse) && imageResponse.length > 0) {
        tempImageUrl = imageResponse[0];
      } else if (typeof imageResponse === 'object' && imageResponse !== null && 'url' in imageResponse) {
        // Photon returns an object with a url() function that needs to be called
        try {
          const urlFunction = (imageResponse as any).url;
          if (typeof urlFunction === 'function') {
            tempImageUrl = await urlFunction();
        } else {
              tempImageUrl = (imageResponse as any).url;
            }
          } catch (urlError) {
            console.error('Error getting URL from Photon response:', urlError);
            tempImageUrl = String(imageResponse);
          }
        } else {
          // Fallback: try to convert to string
          tempImageUrl = String(imageResponse);
        }

        if (tempImageUrl && typeof tempImageUrl === 'string' && tempImageUrl.startsWith('http')) {
          console.log('Generated temp image URL:', tempImageUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(tempImageUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else if (tempImageUrl && typeof tempImageUrl === 'object' && (tempImageUrl as any).href) {
          // Handle URL object - extract href
          const actualUrl = (tempImageUrl as any).href;
          console.log('Generated temp image URL (from URL object):', actualUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(actualUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else {
          console.warn('Invalid image URL received:', tempImageUrl);
        }
      }

      // NOW WE SHOULD HAVE ALL THE URLS WE NEED TO CREATE THE ARTICLE

      // STUB - 9. CREATE THE ARTICLE
      const wordCount = articleText.split(/\s+/).length;
      const estimatedDuration = Math.ceil(wordCount / 4);

      console.log('✅ Updated article with all media URLs');
      console.log('📊 Estimated duration:', durationSeconds, 'seconds');

      console.log('Creating complete article...');
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
          title,
          text: articleText,
          topic: category,
        url: audioUrl as string,
        artwork: imageUrl as string,
        user_db_id: args.user?.user_db_id,
        nsfw: isNSFW,
        favorited: false,
        featured: false,
        upvotes: 0,
        tag: 'user_generated',
        artist: args.user?.name || 'Unknown User',
        contentType: 'article',
        duration: durationSeconds,
      });
      await ctx.runMutation(api.users.incrementArticleRuns, {
      userId: args.user?._id as Id<"users">,
      });
  await ctx.runMutation(api.contentAnalytics.recordTrackingToken, {
      contentType: 'article',
      content_id: tempArticleId,
      item_url: `generated_elevenlabs_${Date.now()}`,
    token_type: 'play_token',
    });
    console.log('✅ Successfully created complete article with ID:', tempArticleId);

    return {
      success: true,
    };

  } catch (error: any) {
    console.error('ElevenLabs article generation failed:', error);
    return {
      success: false,
      error: `Article generation failed: ${error.message || 'Unknown error'}`
    };
  }

  },
});

// REVIEW - GTG Generate CUSTOM article using Replicate (server-side action)
export const generateArticleReplicateCustom = action({
  args: {
    user: v.object({
      _id: v.id("users"),
      name: v.string(),
      user_db_id: v.string(),
      article_generation_runs: v.number(),
      article_generation_runs_limit: v.number(),
    }),
    query: v.string(),
    form_id: v.optional(v.string()),
    customVoiceId: v.optional(v.string()),
    replicateApiKey: v.string(),
    elevenLabsApiKey: v.optional(v.string()),
    awsAccessKey: v.string(),
    awsSecretKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
    error?: string;
    isLimitReached?: boolean;
  }> => {

    const multiDbId = `${args.user?.user_db_id}-${Date.now()}`;

    // ----------------------------------------------------------------------------
    
    try {
      console.log('Starting custom article generation...');
      
      // Validate API key before using it
      if (!args.replicateApiKey || args.replicateApiKey.trim() === '') {
        return {
          success: false,
          error: "Replicate API key is missing or invalid"
        };
      }

      // STUB - 1. Initialize Replicate client with passed API key
      const replicateClient = new Replicate({
        auth: args.replicateApiKey,
      });

      // STUB - 2. Generate title using Replicate SDK
      console.log('Calling Replicate SDK for title generation...');
      
      const titleInput = {
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
      };

      const titleResult = await replicateClient.run(metaLlamaString, { input: titleInput });
      console.log('Title generation result:', titleResult);
      
      // Extract the actual title from the SDK result (no status wrapper)
      let title = `${args.query.substring(0, 40)}`; // fallback 
      if (titleResult) {
        const rawTitle = Array.isArray(titleResult) 
          ? titleResult.join('').trim() 
          : String(titleResult).trim();
        
        // Clean up the title (remove quotes, extra spaces, etc.)
        title = rawTitle.replace(/^["']|["']$/g, '').trim() || title;
        console.log('Generated title:', title);
      } else {
        console.warn('No title result received from SDK');
      }

      // STUB - 3. THIS IS A CUSTOM ARTICLE, SO NO NEED TO GENERATE ARTICLE TEXT.
      let articleText = args.query;


      // STUB - 4. Category is D.I.Y
      let category = 'D.I.Y'; // SINCE THIS IS A CUSTOM ARTICLE, IT IS DIY

      // STUB - 5. Check NSFW status using SDK
      const nsfwInput = {
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
      };     
      const nsfwResult = await replicateClient.run(metaLlamaString, { input: nsfwInput });
      let isNSFW = false;
      if (nsfwResult) {
        const rawNsfw = Array.isArray(nsfwResult) 
          ? nsfwResult.join('').trim() 
          : String(nsfwResult).trim();
        isNSFW = rawNsfw === "NSFW";
        console.log('NSFW check result:', isNSFW);
      }

      // STUB - 6. Generate audio using Replicate SDK and upload to S3
      console.log('Generating audio for article using Replicate SDK...');

      let audioUrl = null;
      let imageUrl = null;
      
      const s3Client = new S3({
        region: 'us-east-2',
        credentials: {
          accessKeyId: args.awsAccessKey,
          secretAccessKey: args.awsSecretKey,
        },
      });

      // STUB - 7. Generate Audio
      console.log('🎵 Generating audio...');
      const audioInput = {
        text: articleText,
        voice: args.customVoiceId || "af_kore",
        speed: 0.88,
      };

      console.log('🎯 Using voice:', audioInput.voice);
      console.log('🎯 Audio text length:', articleText.length);

      const audioResponse = await replicateClient.run(kokoroString, { input: audioInput });

      if (audioResponse) {
        const tempAudioUrl = audioResponse.toString();
        console.log('Generated temp audio URL:', tempAudioUrl);
        
        // Download and upload audio to S3
        const audioFetch = await fetch(tempAudioUrl);
        if (audioFetch.ok) {
          const audioBuffer = await audioFetch.arrayBuffer();
          const audioS3Key = `${multiDbId}.mp3`;
          
          await s3Client.send(new PutObjectCommand({
            Bucket: "readio-audio-files",
            Key: audioS3Key,
            Body: Buffer.from(audioBuffer),
            ContentType: 'audio/mpeg',
          }));

          audioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${audioS3Key}`;
          console.log('✅ Audio uploaded to S3:', audioUrl);
        }
      }

      // STUB - 8. Generate Image
      console.log('🎨 Generating image...');
      
      // First, generate image prompt using LLaMA SDK
      const imagePromptInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_tokens: 500,
        prompt: `Create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${title}"
        And a preview: "${articleText.substring(0, 200)}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
        system_prompt: systemPromptReplicateImageQuery,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
        presence_penalty: 0,
        length_penalty: 1,
        log_performance_metrics: false
      };

      const imagePromptResult = await replicateClient.run(metaLlamaString, { input: imagePromptInput });

      let imagePrompt = `A thoughtful, cinematic scene representing the concept: ${title}`;
      if (imagePromptResult) {
        const rawPrompt = Array.isArray(imagePromptResult) 
          ? imagePromptResult.join('').trim() 
          : String(imagePromptResult).trim();
        imagePrompt = rawPrompt || imagePrompt;
        console.log('Generated image prompt:', imagePrompt);
      }

      // Generate image with Photon
      console.log('🎨 Generating image with prompt:', imagePrompt.substring(0, 100) + '...');
      const imageResponse = await replicateClient.run("luma/photon-flash", {
        input: { prompt: imagePrompt }
      });

      if (imageResponse) {
        let tempImageUrl = '';
        
        // Handle different response formats from Photon
        if (typeof imageResponse === 'string') {
          tempImageUrl = imageResponse;
        } else if (Array.isArray(imageResponse) && imageResponse.length > 0) {
          tempImageUrl = imageResponse[0];
        } else if (typeof imageResponse === 'object' && imageResponse !== null && 'url' in imageResponse) {
          // Photon returns an object with a url() function that needs to be called
          try {
            const urlFunction = (imageResponse as any).url;
            if (typeof urlFunction === 'function') {
              tempImageUrl = await urlFunction();
        } else {
              tempImageUrl = (imageResponse as any).url;
            }
          } catch (urlError) {
            console.error('Error getting URL from Photon response:', urlError);
            tempImageUrl = String(imageResponse);
          }
        } else {
          // Fallback: try to convert to string
          tempImageUrl = String(imageResponse);
        }

        if (tempImageUrl && typeof tempImageUrl === 'string' && tempImageUrl.startsWith('http')) {
          console.log('Generated temp image URL:', tempImageUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(tempImageUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else if (tempImageUrl && typeof tempImageUrl === 'object' && (tempImageUrl as any).href) {
          // Handle URL object - extract href
          const actualUrl = (tempImageUrl as any).href;
          console.log('Generated temp image URL (from URL object):', actualUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(actualUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${multiDbId}.jpg`;
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else {
          console.warn('Invalid image URL received:', tempImageUrl);
        }
      }

      // NOW WE SHOULD HAVE ALL THE URLS WE NEED TO CREATE THE ARTICLE

      // STUB - 9. CREATE THE ARTICLE
      const wordCount = articleText.split(/\s+/).length;
      const estimatedDuration = Math.ceil(wordCount / 4);

      console.log('✅ Updated article with all media URLs');
      console.log('📊 Estimated duration:', estimatedDuration, 'seconds');

      console.log('Creating complete article...');
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
          title,
          text: articleText,
          topic: category,
        url: audioUrl as string,
        artwork: imageUrl as string,
        user_db_id: args.user?.user_db_id,
        nsfw: isNSFW,
        favorited: false,
        featured: false,
        upvotes: 0,
        tag: 'user_generated',
        artist: args.user?.name || 'Unknown User',
        contentType: 'article',
        duration: estimatedDuration,
      });
      await ctx.runMutation(api.users.incrementArticleRuns, {
      userId: args.user?._id as Id<"users">,
      });
      await ctx.runMutation(api.contentAnalytics.recordTrackingToken, {
        contentType: 'article',
        content_id: tempArticleId,
        item_url: `generated_custom_replicate_${Date.now()}`,
        token_type: 'play_token',
      });
      console.log('✅ Successfully created complete article with ID:', tempArticleId);
      
      return {
        success: true,
        // remainingGenerations: limit - currentRuns - 1,
      };

    } catch (error: any) {
      console.error('Custom Replicate article generation failed:', error);
      return {
        success: false,
        error: `Article generation failed: ${error.message || 'Unknown error'}`
      };
    }

  },
});

// REVIEW Generate CUSTOM article using ElevenLabs (server-side action)
export const generateArticleElevenLabsCustom = action({
  args: {
    user: v.object({
      _id: v.id("users"),
      name: v.string(),
    user_db_id: v.string(),
      article_generation_runs: v.number(),
      article_generation_runs_limit: v.number(),
      user_role: v.string(),
      stic_voice_usage_seconds: v.number(),
      article_runs_last_reset_at: v.string(),
    }),
    query: v.string(),
    form_id: v.optional(v.string()),
    customVoiceId: v.optional(v.string()),
    replicateApiKey: v.string(),
    elevenLabsApiKey: v.string(),
    awsAccessKey: v.string(),
    awsSecretKey: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    article?: any;
    remainingGenerations?: number;
    error?: string;
    isLimitReached?: boolean;
  }> => {
    
    try {
      // Handle custom ElevenLabs generation inline

      // Validate API keys before using them
      if (!args.replicateApiKey || args.replicateApiKey.trim() === '') {
        return {
          success: false,
          error: "Replicate API key is missing or invalid"
        };
      }

      if (!args.elevenLabsApiKey || args.elevenLabsApiKey.trim() === '') {
        return {
          success: false,
          error: "ElevenLabs API key is missing or invalid"
        };
      }

      // STUB - 1. Initialize Replicate client with passed API key
      const replicateClient = new Replicate({
        auth: args.replicateApiKey,
      });

      // STUB - 2. Generate title using Replicate SDK
      const titleInput = {
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
      };
      const titleOutput = await replicateClient.run(metaLlamaString, { input: titleInput });
      const title = (Array.isArray(titleOutput) ? titleOutput.join("") : String(titleOutput)).trim();

      // STUB - 3. THIS IS A CUSTOM ARTICLE, SO NO NEED TO GENERATE ARTICLE TEXT.
      let articleText = args.query;

      // STUB - 4. Category is D.I.Y
      let category = 'D.I.Y'; // SINCE THIS IS A CUSTOM ARTICLE, IT IS DIY

      // STUB - 5. Check NSFW
      const nsfwInput = {
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
      };
      const nsfwOutput = await replicateClient.run(metaLlamaString, { input: nsfwInput });
      const isNSFW = (Array.isArray(nsfwOutput) ? nsfwOutput.join("") : String(nsfwOutput)).trim() === "NSFW";

      // STUB - 6. Generate audio using ElevenLabs HTTP API (like your existing approach)
      console.log('Generating audio with ElevenLabs HTTP API...');

      const audioResult = await generateElevenLabsAudio(
        args.query, 
        EL_SticVoiceId, 
        args.elevenLabsApiKey as string, 
        args.user?.user_role || 'normie'
      );

      if (!audioResult.success) {
        return {
          success: false,
          error: `Audio generation failed: ${audioResult.error}`
        };
      }

      const base64Audio = audioResult.audioData;
      const durationSeconds = audioResult.duration || 0;

      // Upload audio to S3 to get proper URL
      let audioUrl = '';
      try {
        if (!base64Audio) {
          return {
            success: false,
            error: 'No audio data available for upload'
          };
        }

        const s3Client = new S3({
          region: 'us-east-2',
          credentials: {
            accessKeyId: args.awsAccessKey,
            secretAccessKey: args.awsSecretKey,
          },
        });

        // Convert base64 to buffer and upload to S3
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        const audioS3Key = `${Date.now()}_elevenlabs_custom.mp3`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: "readio-audio-files",
          Key: audioS3Key,
          Body: audioBuffer,
          ContentType: 'audio/mpeg',
        }));

        audioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${audioS3Key}`;
        console.log('✅ Audio uploaded to S3:', audioUrl);
      } catch (uploadError) {
        console.error('❌ Failed to upload audio to S3:', uploadError);
        // Continue without S3 upload - article will be created without audio URL
      }

      // STUB - 7. Generate image prompt
      const imagePromptInput = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_tokens: 500,
        prompt: `Create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${title}"
        And a preview: "${args.query.substring(0, 100)}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
        system_prompt: systemPromptReplicateImageQuery,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\\n\\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
        presence_penalty: 0,
        length_penalty: 1,
        log_performance_metrics: false
      };

      const imagePromptOutput = await replicateClient.run(metaLlamaString, { input: imagePromptInput });
      const imagePrompt = (Array.isArray(imagePromptOutput) ? imagePromptOutput.join("") : String(imagePromptOutput)).trim();

      // STUB - 8. Generate illustration
      const illustrationOutput = await replicateClient.run("luma/photon-flash", {
        input: { prompt: imagePrompt }
      });

      let imageUrl = '';
      if (illustrationOutput) {
        let tempImageUrl = '';
        
        // Handle different response formats from Photon
        if (typeof illustrationOutput === 'string') {
          tempImageUrl = illustrationOutput;
        } else if (Array.isArray(illustrationOutput) && illustrationOutput.length > 0) {
          tempImageUrl = illustrationOutput[0];
        } else if (typeof illustrationOutput === 'object' && illustrationOutput !== null && 'url' in illustrationOutput) {
          // Photon returns an object with a url() function that needs to be called
          try {
            const urlFunction = (illustrationOutput as any).url;
            if (typeof urlFunction === 'function') {
              tempImageUrl = await urlFunction();
            } else {
              tempImageUrl = (illustrationOutput as any).url;
            }
          } catch (urlError) {
            console.error('Error getting URL from Photon response:', urlError);
            tempImageUrl = String(illustrationOutput);
          }
        } else {
          // Fallback: try to convert to string
          tempImageUrl = String(illustrationOutput);
        }

        if (tempImageUrl && typeof tempImageUrl === 'string' && tempImageUrl.startsWith('http')) {
          console.log('Generated temp image URL:', tempImageUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(tempImageUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${Date.now()}_elevenlabs_custom.jpg`;
            
            const s3Client = new S3({
              region: 'us-east-2',
              credentials: {
                accessKeyId: args.awsAccessKey,
                secretAccessKey: args.awsSecretKey,
              },
            });
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else if (tempImageUrl && typeof tempImageUrl === 'object' && (tempImageUrl as any).href) {
          // Handle URL object - extract href
          const actualUrl = (tempImageUrl as any).href;
          console.log('Generated temp image URL (from URL object):', actualUrl);
          
          // Download and upload image to S3
          const imageFetch = await fetch(actualUrl);
          if (imageFetch.ok) {
            const imageBuffer = await imageFetch.arrayBuffer();
            const imageS3Key = `${Date.now()}_elevenlabs_custom.jpg`;
            
            const s3Client = new S3({
              region: 'us-east-2',
              credentials: {
                accessKeyId: args.awsAccessKey,
                secretAccessKey: args.awsSecretKey,
              },
            });
            
            await s3Client.send(new PutObjectCommand({
              Bucket: "lotus-image-files",
              Key: imageS3Key,
              Body: Buffer.from(imageBuffer),
              ContentType: 'image/jpeg',
            }));

            imageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${imageS3Key}`;
            console.log('✅ Image uploaded to S3:', imageUrl);
          }
        } else {
          console.warn('Invalid image URL received:', tempImageUrl);
        }
      }

      // STUB - 9. Create article
      const tempArticleId = await ctx.runMutation(api.articles.createArticle, {
        title,
        text: articleText,
        topic: category,
        url: audioUrl as string,
        artwork: imageUrl as string,
        user_db_id: args.user?.user_db_id,
        nsfw: isNSFW,
        favorited: false,
        featured: false,
        upvotes: 0,
        tag: 'user_generated',
        artist: args.user?.name || 'Unknown User',
        contentType: 'article',
        duration: durationSeconds,
      });

      // Update user's voice usage
      await ctx.runMutation(api.users.updateVoiceUsage, {
        userId: args.user?._id,
        duration: durationSeconds
      });

      await ctx.runMutation(api.users.incrementArticleRuns, {
        userId: args.user?._id,
      });

      await ctx.runMutation(api.contentAnalytics.recordTrackingToken, {
        contentType: 'article',
        content_id: tempArticleId,
        item_url: `generated_custom_elevenlabs_${Date.now()}`,
        token_type: 'play_token',
      });

      return {
        success: true,
      };

    } catch (error: any) {
      console.error('Custom ElevenLabs article generation failed:', error);
      return {
        success: false,
        error: `Article generation failed: ${error.message || 'Unknown error'}`
      };
    }
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


