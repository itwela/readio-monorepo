import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// ANCHOR - System Prompts
import { 
  systemPromptReplicateImageQuery, 
  systemPromptForArticleTitle, 
  systemPromptChooseCategory, 
  systemPromptNSFW, 
  systemPromptForArticleGeneration 
} from './constants';

// REVIEW - Type definitions
type MutationResult = {
  path?: string;
  audioUrl?: string;
  storageId?: string;
  duration?: number;
  success: boolean;
  result?: any;
  error?: string;
};

interface StorageResult {
  storageId: string;
}

/**
 * REVIEW Generate an article title using AI
 */
export const generateTitle = mutation({
  args: {
    query: v.string(),
    clients: v.any(), // Replicate/S3 clients
    user: v.optional(v.any()) // User context
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 100,
        prompt: `Generate a short, rhythmic title using the Lotus Auto-Title Generator style. Here is a preview: ${args.query.substring(0, 100)}.
        Prioritize clarity + curiosity. The title should sound like the name of a chapter, short film, or spoken essay.
        Make sure it includes the topic or technique when relevant. Never use generic inspiration, clickbait, or vague poetry.
        Avoid poetic titles unless they clearly include the subject (person, concept, or metaphor).
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the title text
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's a title..." or "This title..."
        4. AGAIN, NO QUOTES!!!!!!!!!!!!!!!!!!! JUST GIVE THE TITLE.`,
        system_prompt: systemPromptForArticleTitle,
      };

      const output = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
      let title = Array.isArray(output) ? output.join("") : String(output);
      title = title.trim();

      return {
        success: true,
        result: { title }
      };

    } catch (error) {
      console.error("Error generating title:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Title generation failed"
      };
    }
  }
});

/**
 * REVIEW - Generate an article category using AI 
 */
export const generateCategory = mutation({
  args: {
    title: v.string(),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please give me a category for this title: ${args.title}. Respond with just the category name, no additional text.`,
        system_prompt: systemPromptChooseCategory,
      };

      const output = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
      let category = Array.isArray(output) ? output.join("") : String(output);
      category = category.trim().replace(/\s+/g, '');

      return {
        success: true,
        result: { category }
      };
    } catch (error) {
      console.error("Error generating category:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Category generation failed"
      };
    }
  }
});

/**
 * REVIEW - Check if content is NSFW using AI
 */
export const checkNSFW = mutation({
  args: {
    title: v.string(),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please check this title for NSFW content: "${args.title}"
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY "NSFW" or "SAFE", no other text
        2. NO explanations, NO commentary, NO quotes`,
        system_prompt: systemPromptNSFW,
      };

      const output = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
      const nsfw = Array.isArray(output) ? output.join("") : String(output);

      return {
        success: true,
        result: { 
          isNSFW: nsfw.trim() === "NSFW",
          classification: nsfw.trim()
        }
      };
    } catch (error) {
      console.error("Error checking NSFW:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "NSFW check failed"
      };
    }
  }
});

/**
 * REVIEW - Generate article content using AI
 */
export const generateArticleContent = mutation({
  args: {
    query: v.string(),
    title: v.string(),
    clients: v.any(),
    serviceProvider: v.union(v.literal("replicate"), v.literal("elevenlabs"))
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const systemPrompt = systemPromptForArticleGeneration;
      const userPrompt = `
        The topic is: ${args.query}.
        The title is: ${args.title}.

        IMPORTANT INSTRUCTIONS:
        1. Use ellipsis (...) for natural pauses
        2. No Markdown formatting
        3. Return ONLY the article text, no additional text`;

      const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 1500,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: userPrompt,
        system_prompt: systemPrompt,
      };

      const output = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
      let articleText = Array.isArray(output) ? output.join("") : String(output);
      articleText = articleText.trim();

      return {
        success: true,
        result: { articleText }
      };
    } catch (error) {
      console.error("Error generating article:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Article generation failed"
      };
    }
  }
});

/**
 * REVIEW - Generate an image prompt for Replicate
 */
export const generateImagePrompt = mutation({
  args: {
    title: v.string(),
    articleText: v.optional(v.string()),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 2000,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${args.title}"
        ${args.articleText ? `And a preview: "${args.articleText.substring(0, 100)}"` : ''}
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."`,
      };

      const output = await args.clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
      const replicateQuery = Array.isArray(output) ? output.join("") : String(output);

      return {
        success: true,
        result: { prompt: replicateQuery.trim() }
      };
    } catch (error) {
      console.error("Error generating image prompt:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Image prompt generation failed"
      };
    }
  }
});

/**
 * REVIEW - Generate article illustration using Replicate
 */
export const generateIllustration = mutation({
  args: {
    prompt: v.string(),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const output = await args.clients.replicateClient.run("luma/photon-flash", {
        input: { prompt: args.prompt }
      });

      let imageUrl = '';
      if (output && typeof output === 'object' && typeof (output as any).url === 'function') {
        imageUrl = await (output as any).url();
      }

      if (imageUrl) {
        return {
          success: true,
          result: { imageUrl }
        };
      }
      return {
        success: false,
        error: "No image URL found in Replicate output"
      };
    } catch (error) {
      console.error("Error generating illustration:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Illustration generation failed"
      };
    }
  }
});

/**
 * REVIEW - Generate audio from text using Replicate
 */
export const generateAudioReplicate = mutation({
  args: {
    text: v.string(),
    voice: v.string(),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const input = {
        text: args.text,
        voice: args.voice,
        speed: 0.88,
      };

      const response = await args.clients.replicateClient.run(
        "jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13", 
        { input }
      );

      if (!response) {
        return {
          success: false,
          error: "No response received from Replicate"
        };
      }

      const audioUrl = response.toString();
      
      // Download the audio file and convert to base64 for S3 upload
      try {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          return {
            success: false,
            error: `Failed to download audio: ${audioResponse.status}`
          };
        }
        
        const audioBuffer = await audioResponse.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        
        // Simple duration estimate (4 words per second)
        const wordCount = args.text.split(/\s+/).length;
        const durationSeconds = Math.ceil(wordCount / 4);

        return {
          success: true,
          result: { 
            audioData: base64Audio,
            duration: durationSeconds,
            originalUrl: audioUrl
          }
        };
      } catch (downloadError) {
        return {
          success: false,
          error: `Failed to process audio file: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`
        };
      }

    } catch (error) {
      console.error("Error generating audio:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Audio generation failed"
      };
    }
  }
});

/**
 * REVIEW - Generate audio from text using ElevenLabs
 */
export const generateAudioElevenLabs = mutation({
  args: {
    text: v.string(),
    voiceId: v.string(),
    apiKey: v.string(),
    userRole: v.string()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    const headers = {
      'Content-Type': 'application/json',
      'xi-api-key': args.apiKey,
    };

    const requestBody = {
      text: args.text,
      voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.95 },
      model_id: args.userRole === "admin" ? "eleven_multilingual_v2" : "eleven_flash_v2"
    };

    try {
      // 1. Call ElevenLabs API
      const response = await fetch(`${baseUrl}/${args.voiceId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.text();
        return { 
          success: false, 
          error: `ElevenLabs API Error: ${response.status} ${error}`
        };
      }

      // 2. Convert audio to base64 for S3 upload
      const audioData = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioData).toString('base64');

      // 3. Simple duration estimate (4 words per second)
      const wordCount = args.text.split(/\s+/).length;
      const durationSeconds = Math.ceil(wordCount / 4);

      return { 
        success: true,
        result: {
          audioData: base64Audio,
          duration: durationSeconds
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

/**
 * REVIEW - Upload files to S3
 */
export const uploadToS3 = mutation({
  args: {
    fileType: v.union(v.literal("audio"), v.literal("image")),
    fileId: v.string(),
    fileData: v.any(),
    clients: v.any()
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    try {
      const bucket = args.fileType === "audio" 
        ? "readio-audio-files" 
        : "lotus-image-files";
      
      const contentType = args.fileType === "audio"
        ? "audio/mpeg"
        : "image/jpeg";

      await args.clients.s3Client?.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `${args.fileId}.${args.fileType === "audio" ? "mp3" : "jpg"}`,
        Body: args.fileData,
        ContentEncoding: 'base64',
        ContentType: contentType,
      }));

      return {
        success: true,
        result: { 
          url: `https://${bucket}.s3.us-east-2.amazonaws.com/${args.fileId}.${args.fileType === "audio" ? "mp3" : "jpg"}`
        }
      };
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "S3 upload failed"
      };
    }
  }
});
