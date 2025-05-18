import { geminiCategory, geminiNSFW, geminiPexals, geminiReplicate, geminiTitle } from '@/helpers/geminiClient';
import sql from '@/helpers/neonClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { replicate } from '@/helpers/replicateClient';
import { s3 } from '@/helpers/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { chatgpt } from '@/helpers/openAiClient';
import { systemPromptForArticleGeneration, systemPromptForArticleTitle, systemPromptNSFW, systemPromptReplicateImageQuery } from '@/constants/tokens';
import Constants from 'expo-constants';
import { writeFile } from "node:fs/promises";
import { Audio } from 'expo-av';


// const extra = Constants.expoConfig.extra;
// const accessKeyIdParts = [
//     extra.ELEVENLABS_API_KEY_1,
//     extra.ELEVENLABS_API_KEY_2,
// ];
// const salt = extra.SALT;
// STUB - ARCHIVED ENV METHOD
// const reconstructKey = (parts: string[]) => parts.join("");

const {
    ELEVENLABS_API_KEY
} = Constants?.expoConfig?.extra || {};

// Reconstruct 
export const accessKeyId = ELEVENLABS_API_KEY;

export const EL_SticVoiceId = 'XFYDnaQFQ0Mygtem97ek'
export const kokoroString = 'jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13'

export type handleGenerateArticleProps = {
    form: any;
    user: any;
};

export async function bas64_It(path: string) {

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    let audioBuffer;

    try {
        audioBuffer = Buffer.from(base64Audio, 'base64');
        console.log('Audio buffer created successfully');
    } catch (error) {
        console.error('Error creating audio buffer:', error);
    }

    return audioBuffer;

}

// NOTE - CATEGORY GENERATION ==================================================
export async function createArticleCategory(title: any) {

    let category = "";
    const promptCategory = `Please give me a category for this title: ${title}.`;
    const resultCategory = await geminiCategory.generateContent(promptCategory);
    const geminiCategoryResponse = resultCategory.response;
    const textCategory = geminiCategoryResponse.text();
    category = textCategory.replace(/\s+/g, '');
    console.log("set category response: ", category);

    return {
        category: category,
        success: true,
        errorMessege: "",
    }
}

// NOTE - TITLE GENERATION ==================================================
export async function createArticleTitle(theQuery: string, user: any) {

    const readioTitles = await sql`
      SELECT title FROM readios WHERE user_db_id = ${user?.user_db_id}
    `;

    console.log("Starting Gemini...");
    let title = "";
    const promptTitle = `
        
        <system>
            ${systemPromptForArticleTitle}
        </system>
    
        Generate a short, rhythmic title using the Lotus Auto-Title Generator style. Here is a preview of the article: ${theQuery.substring(0, 100)}.
        Prioritize clarity + curiosity. The title should sound like the name of a chapter, short film, or spoken essay.
        Make sure it includes the topic or technique when relevant. Never use generic inspiration, clickbait, or vague poetry.
        Avoid poetic titles unless they clearly include the subject (person, concept, or metaphor). 
        `;

    try {
        const resultTitle = await geminiTitle.generateContent(promptTitle);
        const geminiTitleResponse = resultTitle.response;
        const textTitle = geminiTitleResponse.text();
        if (textTitle.length > 0) {
            title = textTitle;
            console.log("set title response: ", title);
            return {
                title: title,
                success: true,
                errorMessege: "",
            }
        }
    } catch (error) {
        console.error("Error generating title:", error);
        return {
            title: "",
            success: false,
            errorMessege: "Error generating title"
        }
    }

}

// NOTE - NSFW CHECK ==========================================================
export async function checkForNSFWContent(articleTitle: string) {
    const promptNSFW = `

        <system>
            ${systemPromptNSFW}
        </system>

        Please check the following title for NSFW content: "${articleTitle}"
    `;

    try {
        const resultNSFW = await geminiNSFW.generateContent(promptNSFW);
        const geminiNSFWResponse = resultNSFW.response;
        const textNSFW = geminiNSFWResponse.text();
        console.log("set nsfw response: ", textNSFW);
        return {
            nsfw: textNSFW,
            success: true,
        }
    } catch (error) {
        console.error("Error checking for NSFW content:", error);
        return {
            nsfw: "",
            success: false,
        }
    }
}
// NOTE - REPLICATE QUERY GENERATION ===========================================
export async function createReplicateQuery(title: string, articleText?: any) {

    let replicateQuery = "";
    const promptReplicate = `

    <system>
        ${systemPromptReplicateImageQuery}
    </system>

    Your task is to create a detailed image prompt for Replicate's Photon model.
    The content is an article titled: "${title}"
    And a preview: "${articleText.substring(0, 100)}"

    `;

    try {
        const resultReplicate = await geminiReplicate.generateContent(promptReplicate);
        const geminiReplicateResponse = resultReplicate.response;
        const textReplicate = geminiReplicateResponse.text();
        replicateQuery = textReplicate;
        console.log("set replicate response: ", replicateQuery);
        return {
            replicateQuery: replicateQuery,
            success: true,
            errorMessege: "",
        }
    } catch (error) {
        console.error("Error generating Replicate query:", error);
        return {
            replicateQuery: "",
            success: false,
            errorMessege: "Error generating Replicate query",
        }
    }

}

// NOTE - REPLICATE ILLUSTRATION GENERATION ===================================
export async function createArticleIllustration_Replicate(replicateQuery: string) {

    try {

        const output = await replicate.run("luma/photon-flash", {
            input: { prompt: replicateQuery }
        });


        // Handle the function url() case specifically
        let imageUrl = '';

        if (output && typeof output === 'object' && typeof (output as any).url === 'function') {
            // If url is a function, call it
            imageUrl = await (output as any).url();
            console.log('Called url() function');
            console.log('[1111] Image URL:', imageUrl);
        } else {
            // Fallback to other formats
            imageUrl = ''
            console.log('No url() function found');
        }

        if (imageUrl) {

            // Remove surrounding quotes if present
            console.log('[2222] Image URL (raw value):', imageUrl);
            console.log('[DEBUG] typeof imageUrl:', typeof imageUrl);

            // Ensure we are working with a string for subsequent operations
            const imageUrlString = String(imageUrl);
            console.log('[DEBUG] imageUrl coerced to string:', imageUrlString);

            const quoteMark = `"`
            // Check if the string is not empty before calling charAt
            if (imageUrlString.length > 0) {
                console.log('first character in image string:', imageUrlString.charAt(0));
            } else {
                console.log('imageUrlString is empty.');
            }

            let finalImageUrl = imageUrlString;
            if (imageUrlString.startsWith(quoteMark) && imageUrlString.endsWith(quoteMark)) {
                finalImageUrl = imageUrlString.substring(1, imageUrlString.length - 1);
                console.log('Removed quotes from URL:', finalImageUrl);
            } else {
                console.log('URL string did not start and end with the expected quote mark, or was already unquoted:', imageUrlString);
            }

            // Validate if the processed URL looks like a real URL
            if (finalImageUrl && (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://'))) {
                console.log('Final valid image URL:', finalImageUrl);
                return {
                    illustration: finalImageUrl,
                    success: true,
                    errorMessege: "",
                };
            } else {
                console.error('Processed URL is not valid or became empty:', finalImageUrl);
                return {
                    illustration: '',
                    success: false,
                    errorMessege: `Processed URL is not valid: ${finalImageUrl}`,
                };
            }
        } else {
            console.log('No image URL found after attempting to retrieve from Replicate output.');
            return {
                illustration: '',
                success: false,
                errorMessege: "No image URL found in Replicate output.",
            };
        }
    } catch (error) {
        return {
            illustration: '',
            success: false,
            errorMessege: `${'There was an error generating the image from Replicate'} ${error}`,
        }

    }
}

// NOTE - ARTICLE GENERATION WITH AI ==========================================
export async function createArticleWithAi(theQuery: string, title: string) {
    let articleText = "";

    // System prompt defining the AI's role and general instructions
    const systemPrompt = systemPromptForArticleGeneration;

    // User prompt providing the specific task details and the example
    const userPrompt = `

        <system>
            ${systemPrompt}
        </system>

        The topic is: ${theQuery}.
        The title for the article is: ${title}.

        IMPORTANT INSTRUCTIONS:
        2.  The article's text MUST use "Ellipsis-Based Pause Formatting". This means:
            *   Use ellipses (...) strategically to create natural pauses and flow.
            *   The goal is to mimic the rhythm of human speech, emphasizing reflective moments and transitions.
            *   Apply ellipses:
                a. At the end of key phrases to signal a brief pause.
                b. Between connected thoughts to guide pacing naturally.
                c. Sparingly, ensuring the text remains fluid and conversational.
        3.  DO NOT use any Markdown formatting. This means NO bolding (no **text**), no headers (no ## Headers), no italics, etc. The ONLY formatting allowed is the ellipsis (...) and standard paragraph breaks (a single newline character between paragraphs).
        4.  The entire output should be a single block of plain text. The title should be the first line, followed by a blank line, then the article body.

        Here is a SHORT EXAMPLE of the desired "Ellipsis-Based Pause Formatting" and NO Markdown:
        Topic: The Joy of Reading
        Title: Unlocking Worlds: One Page at a Time

        Unlocking Worlds... One Page at a Time

        Reading is more than just decoding words on a page... it's an adventure. It allows us to travel to distant lands... meet fascinating characters... and explore ideas that challenge our perspectives. Each book... a new journey. Sometimes... a quiet reflection is needed... to truly absorb the meaning. This simple act... can profoundly shape our understanding of the world... and ourselves.

        Now, please write the article about "${theQuery}" with the title "${title}" following ALL the instructions above.
    `;

    try {
        const input = {
            // Model-specific parameters for meta-llama-3-8b-instruct
            top_k: 0, // As per Llama 3 example
            top_p: 0.95, // Consistent with Llama 3 example and your previous settings
            temperature: 0.7, // As per Llama 3 example
            max_new_tokens: 1500, // Increased for potentially longer articles, adjust as needed
            stop_sequences: "<|end_of_text|>,<|eot_id|>", // Standard stop sequences for Llama 3

            // Prompts and template
            prompt: userPrompt,
            system_prompt: systemPrompt,
            // Official prompt template for Llama 3 Instruct models
            prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        };

        console.log("Running Replicate with Llama 3 model (non-streaming)...");
        // Switch from replicate.stream to replicate.run
        const output = await replicate.run("meta/meta-llama-3-8b-instruct", { input });

        console.log("Raw output from Replicate (Llama 3):", output);

        // Llama 3 via replicate.run typically returns an array of strings (tokens)
        if (Array.isArray(output)) {
            articleText = output.join("");
        } else if (typeof output === 'string') { // Fallback if it's a single string
            articleText = output;
        } else {
            console.warn("Unexpected output format from Llama 3 with replicate.run. Expected array or string.");
            articleText = String(output); // Coerce to string as a last resort
        }

        // Basic cleanup if the model adds unwanted newlines at start/end
        articleText = articleText.trim();

        console.log("--- Joined and Processed Article Text (Llama 3) ---");
        console.log(articleText);
        console.log("--- End of Article Text (Llama 3) ---");

        return {
            articleText: articleText,
            success: true,
            errorMessege: "", // Consistent with your previous return structure
        };

    } catch (error) {
        console.error("Error calling Replicate API with Llama 3:", error);
        return {
            articleText: "",
            success: false,
            // Ensure 'errorMessage' matches your other error returns if standardized
            errorMessege: error instanceof Error ? error.message : "Unknown error with AI generation",
        };
    }
}

// NOTE - ADD ARTICLE TO DATABASE ==============================================
export async function addArticleToDB(
    illustration: string,
    theArticleText: any,
    topic: string,
    user: any,
    title: string,
    artist: string,
    duration?: number,
    articleIsNSFW?: boolean
) {
    // Save to database
    console.log("Starting Supabase....");

    // NOTE FOR HANDLING STIC VOICE DURATION
    if (duration) {

        console.log("Duration: ", duration);
        const addReadioToDB = await sql`
            INSERT INTO readios (
              artwork,
              text, 
              topic,
              title,
              user_db_id,
              username,
              artist,
              tag,
              upvotes,
              stic_voice_usage_seconds,
              nsfw
            )
            VALUES (
              ${illustration},
              ${theArticleText},
              ${topic}, 
              ${title},
              ${user?.user_db_id},
              ${user?.name},
              ${artist},
              'default',
              0,
              ${duration},
              ${articleIsNSFW}
            )
            RETURNING id, artwork, text, topic, title, user_db_id, username, artist, tag, upvotes, stic_voice_usage_seconds, nsfw;
          `;
        return addReadioToDB;

    } else {

        const addReadioToDB = await sql`
        INSERT INTO readios (
          artwork,
          text, 
          topic,
          title,
          user_db_id,
          username,
          artist,
          tag,
          upvotes,
          nsfw
        )
        VALUES (
          ${illustration},
          ${theArticleText},
          ${topic}, 
          ${title},
          ${user?.user_db_id},
          ${user?.name},
          ${artist},
          'default',
          0,
          ${articleIsNSFW}
        )
        RETURNING id, artwork, text, topic, title, user_db_id, username, artist, tag, upvotes, nsfw;
      `;
        return addReadioToDB;

    }

}

// NOTE - ADD ARTICLE TO AMAZON ===============================================
export async function addArticleToAmazon(temp_Article_From_DB: any, audioBuffer: any) {

    // Upload to S3
    const s3Key = `${temp_Article_From_DB?.[0]?.id}.mp3`;
    const s3ImageKey = `${temp_Article_From_DB?.[0]?.id}.jpg`; // Assuming JPG, adjust if needed or detect from source
    const sourceImageUrl = temp_Article_From_DB?.[0]?.artwork; // This is the URL from Replicate/Pexels

    let imageBufferForS3: Buffer;
    let imageContentType: string = 'image/jpeg'; // Default



    try {
        // Fetch the image from the sourceImageUrl
        console.log("Fetching remote image for S3 upload:", sourceImageUrl);
        const imageResponse = await ReactNativeBlobUtil.fetch('GET', sourceImageUrl);
        const contentTypeHeader = imageResponse.respInfo.headers['Content-Type'] || imageResponse.respInfo.headers['content-type'];
        if (contentTypeHeader) {
            imageContentType = contentTypeHeader;
        }
        const imageBase64 = await imageResponse.base64();
        imageBufferForS3 = Buffer.from(imageBase64, 'base64');
        console.log("Image fetched and converted to buffer. Content-Type:", imageContentType);

        // Using AWS SDK v3 approach ADDING AUDIO TO S3
        await s3.send(new PutObjectCommand({
            Bucket: "readio-audio-files",
            Key: s3Key,
            Body: audioBuffer,
            ContentEncoding: 'base64',
            ContentType: 'audio/mpeg',
        }));
        console.log("S3 audio upload successful");

        // Using AWS SDK v3 approach ADDING IMAGE TO S3
        await s3.send(new PutObjectCommand({
            Bucket: "lotus-image-files",
            Key: s3ImageKey,
            Body: imageBufferForS3, // Use the fetched image buffer
            ContentEncoding: 'base64',
            ContentType: imageContentType, // Use detected or default content type
        }));
        console.log("S3 image upload successful");

    } catch (error) {
        console.error("Failed to fetch image or upload to S3:", error);
        throw error; // Re-throw to be caught by calling function
    }

    // Construct S3 URLs for both audio and image
    const s3AudioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    const s3ImageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${s3ImageKey}`; // Ensure your image bucket URL is correct
    return { s3AudioUrl, s3ImageUrl }; // Return both URLs

}

// NOTE - UPDATE ARTICLE TO DATABASE ==========================================
export async function updateArticleToDb(amazon_article_url: string, amazon_image_url: string, temp_Article_From_DB: any, user: any) {

    await sql`
    UPDATE readios
    SET url = ${amazon_article_url}
    WHERE id = ${temp_Article_From_DB?.[0]?.id} AND user_db_id = ${user?.user_db_id}
    RETURNING *;
  `;

    await sql`
    UPDATE readios
    SET artwork = ${amazon_image_url}
    WHERE id = ${temp_Article_From_DB?.[0]?.id} AND user_db_id = ${user?.user_db_id}
    RETURNING *;
  `;

    return;

}

// NOTE - FETCH AUDIO FROM REPLICATE AND RETURN FILE PATH =====================
export async function fetchAudioFromReplicateAndReturnFilePath(
    text: string,
    voice: string,
): Promise<any> {

    const input = {
        text: text,
        voice: voice,
        speed: 0.85,
    };

    try {
        const response = await replicate.run(
            kokoroString, { input }
        );

        if (!response) {
            return {
                path: "",
                success: false,
                errorMessege: "No response received from Replicate"
            }
        }

        if (typeof response !== 'object') {
            return {
                path: "",
                success: false,
                errorMessege: "Invalid response format: expected object"
            }
        }

        const audioUrl = response.toString();
        console.log("Audio URL from Replicate:", audioUrl);

        // Download the file to local storage
        const localResponse = await ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'wav', // Use the same extension as the original file
        }).fetch('GET', audioUrl);

        const localPath = localResponse.path();
        console.log("Local file path:", localPath);

        if (!localPath) {
            return {
                path: "",
                success: false,
                errorMessege: "Failed to save file locally"
            }
        }

        return {
            path: localPath,
            success: true
        }

    } catch (error) {
        console.error('Error in fetchAudioFromReplicateAndReturnFilePath:', error);
        throw error;
    }
}

// NOTE - FETCH AUDIO FROM ELEVEN LABS AND RETURN FILE PATH ====================
export async function fetchAudioFromElevenLabsAndReturnFilePath(
    text: string,
    voiceId: string,
): Promise<{ path: string; duration: number; success: boolean; errorMessege?: string }> {
    const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': accessKeyId,
    };

    const requestBody = {
        text,
        voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.90 },
        model_id: "eleven_flash_v2"
    };

    try {
        const response = await ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'mp3',
        }).fetch(
            'POST',
            `${baseUrl}/${voiceId}`,
            headers,
            JSON.stringify(requestBody),
        );

        const { status } = response.respInfo;
        if (status !== 200) {
            console.error(`ElevenLabs API HTTP error! status: ${status}`, await response.text());
            return { path: "", duration: 0, success: false, errorMessege: `ElevenLabs API Error: Status ${status}` };
        }

        const localPath = response.path();
        if (!localPath) {
            return { path: "", duration: 0, success: false, errorMessege: "Failed to save audio file locally." };
        }

        // Get audio duration
        let durationSeconds = 0;
        try {
            const { sound, status: soundStatus } = await Audio.Sound.createAsync(
                { uri: `file://${localPath}` }, // Ensure URI has file:// prefix for local files
                { shouldPlay: false }
            );
            if (soundStatus.isLoaded && typeof soundStatus.durationMillis === 'number') {
                durationSeconds = Math.round(soundStatus.durationMillis / 1000);
            }
            await sound.unloadAsync(); // Important to release resources
            console.log(`Audio duration: ${durationSeconds} seconds for path: ${localPath}`);
        } catch (durationError) {
            console.error('Error getting audio duration:', durationError);
            // Decide if this is a critical failure or if you proceed with duration 0
            // For usage tracking, it's better to fail if duration can't be determined.
            return { path: localPath, duration: 0, success: false, errorMessege: "Failed to determine audio duration." };
        }

        return { path: localPath, duration: durationSeconds, success: true };

    } catch (error) {
        console.error('Error in fetchAudioFromElevenLabsAndReturnFilePath:', error);
        return { path: "", duration: 0, success: false, errorMessege: error instanceof Error ? error.message : "Unknown error fetching audio from ElevenLabs" };
    }
}


// STUB -- ARCHIVED FUNCTIONS ==================================================
export async function createPexalsQuery(title: string, articleText?: any) {

    // Check for article text in form and create a variable that contains either articleText or query
    // if (!articleContent) {
    //     return {
    //         pexalQuery: "",
    //         success: false,
    //         errorMessege: "No article text or query provided",
    //     }
    // }
    // Generate Pexels query
    let pexalQuery = "";
    const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and a preview of the article is: ${articleText.substring(0, 100)}.`;

    try {
        const resultPexals = await geminiPexals.generateContent(promptPexals);
        const geminiPexalsResponse = resultPexals.response;
        const textPexals = geminiPexalsResponse.text();
        pexalQuery = textPexals;
        console.log("set pexal response: ", pexalQuery);
        return {
            pexalQuery: pexalQuery,
            success: true,
            errorMessege: "",
        }
    } catch (error) {
        console.error("Error generating Pexels query:", error);
        return {
            pexalQuery: "",
            success: false,
            errorMessege: "Error generating Pexels query",
        }
    }
}

export async function createArticleIllustration_Pexals(pexalQuery: string) {

    let illustration = "";

    const response = await pexelsClient.photos.search({
        query: pexalQuery,
        per_page: 1,
    });

    if (response && "photos" in response && response.photos?.length > 0) {
        illustration = response.photos[0].src.landscape;
        return {
            illustration: illustration,
            success: true,
            errorMessege: "",
        }
    } else {
        console.log("Couldn't find a cool image for you...");
        return {
            illustration: "",
            success: false,
            errorMessege: "Couldn't find a cool image for you...",
        }
    }

}
