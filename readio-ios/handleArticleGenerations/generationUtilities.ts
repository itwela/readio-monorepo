import { geminiCategory, geminiPexals, geminiReplicate, geminiTitle } from '@/helpers/geminiClient';
import sql from '@/helpers/neonClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { replicate } from '@/helpers/replicateClient';
import { s3 } from '@/helpers/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { chatgpt } from '@/helpers/openAiClient';
import { systemPromptForArticleGeneration } from '@/constants/tokens';
import Constants from 'expo-constants';
import { writeFile } from "node:fs/promises";
import { Audio } from 'expo-av';

if (
    !Constants.expoConfig?.extra?.ELEVENLABS_API_KEY_1 ||
    !Constants.expoConfig?.extra?.ELEVENLABS_API_KEY_2
) {
    throw new Error("Eleven Labs credentials not found in expo config");
}

// Extract dummy parts and salt from Expo config
const extra = Constants.expoConfig.extra;

const accessKeyIdParts = [
    extra.ELEVENLABS_API_KEY_1,
    extra.ELEVENLABS_API_KEY_2,
];

const salt = extra.SALT; // Optional salt for added security (not required here)
// Function to combine parts into the full key
const reconstructKey = (parts: string[]) => parts.join("");

// Reconstruct 
export const accessKeyId = reconstructKey(accessKeyIdParts);

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

export async function createArticleTitle_D_I_Y(theQuery: string, user: any) {

    const readioTitles = await sql`
      SELECT title FROM readios WHERE user_db_id = ${user?.user_db_id}
    `;

    console.log("Starting Gemini...");
    let title = "";
    const promptTitle = `Please generate me a good title for this article. Here is a preview of the article: ${theQuery.substring(0, 100)}. Also, here are the titles of the articles I already have. ${readioTitles}. Please give me something new and not in this list.`;

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

export async function createReplicateQuery(title: string, articleText?: any) {

    let replicateQuery = "";
    const promptReplicate = `
    Your task is to create a detailed image prompt for Replicate's Photon model.
    The content is an article titled: "${title}"
    And a preview: "${articleText.substring(0, 100)}"

    From this, identify the core visual subject. Then, embed it into the following master prompt to create a unique, recognizable, and inclusive brand image. The overall aesthetic should feel modern, slightly surreal yet grounded by texture, and reflect an innovative app experience.

    Master Prompt for Photon:
    "Image evoking an innovative and thought-provoking mood, featuring [SUBJECT_FROM_ARTICLE - focus on concepts, objects, or abstract representations rather than specific identifiable people unless the article's core is explicitly about a person. If people are necessary, aim for stylized, ambiguous, or diverse representation]. This image is designed as part of a cohesive visual operating system.

    Shot specifications:
    Aspect Ratio: 1:1 (square, e.g., 1080x1080).
    Point of View: The camera perspective should be generally frontal, capturing the [SUBJECT_FROM_ARTICLE] directly or slightly off-center. Crucially, incorporate strong diagonal compositional elements to create dynamism. For the specific camera angle, [Gemini, select a dramatic and cinematic option suitable for the subject and the overall visual system – this could be a powerful low-angle for an imposing feel, a direct eye-level shot with intense focus and leading lines, a slightly elevated angle for a broader contextual view, or even a subtly canted (Dutch) angle for added tension. Describe how the camera behaves to achieve this]. Ensure the composition is impactful within the square frame.
    Lighting: Harsh, directional vertical flash creating strong contrast, defined forms, and deep shadows.
    Texture Definition: Explicitly render tangible materials, such as [Gemini, suggest 2-3 relevant materials like: 'translucent glowing plastic', 'oxidized metal', 'textured organic surfaces', 'complex woven fabric', 'polished dark stone']. The goal is real, touchable surfaces, not just an atmosphere.
    Intentional Artifacts: Introduce subtle lens scratches, a gentle bloom around light sources, and a fine haze of floating dust or particles to add depth, realism, and build grit into the frame.
    Symbolic Brand Elements: Subtly incorporate abstract or symbolic visual motifs like [Gemini, suggest 1-2 elements such as: 'faint geometric energy patterns', 'softly glowing orbs or rings', 'stylized data streams', 'ethereal light refractions'] that hint at connection, knowledge, or the flow of ideas. These should feel integrated, not tacked on.

    This isn't just an image; it's an expression of a consistent visual language that is both artistic and inclusive, designed to make viewers curious and feel connected to the ideas presented."

    Provide only the completed master prompt as a single string, with no additional text, conversation, or explanation.
    The output should begin directly with "Image evoking..." and end with "...ideas presented.".
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
        1.  Write the article based on the topic and title.
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

export async function addArticleToDB(
    illustration: string,
    theArticleText: any,
    topic: string,
    user: any,
    title: string,
    artist: string,
    duration?: number
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
              stic_voice_usage_seconds
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
              ${duration}
            )
            RETURNING id, artwork, text, topic, title, user_db_id, username, artist, tag, upvotes;
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
          upvotes
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
          0
        )
        RETURNING id, artwork, text, topic, title, user_db_id, username, artist, tag, upvotes;
      `;
      return addReadioToDB;

    }

}

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
    const s3ImageUrl = `https://lotus-iage-files.s3.us-east-2.amazonaws.com/${s3ImageKey}`; // Ensure your image bucket URL is correct

    return { s3AudioUrl, s3ImageUrl }; // Return both URLs

}

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
