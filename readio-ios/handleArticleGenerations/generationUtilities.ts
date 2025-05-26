import sql from '@/helpers/neonClient';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { systemPromptChooseCategory, systemPromptForArticleGeneration, systemPromptForArticleTitle, systemPromptNSFW, systemPromptReplicateImageQuery } from '@/constants/tokens';
import { Audio } from 'expo-av';
import { ApiClients } from '@/helpers/providers/LotusEnvHandler';
// Remove the hook import since we won't be using it directly
// import { useLotusEnv } from '@/helpers/providers/LotusEnvHandler';

export const EL_SticVoiceId = 'XFYDnaQFQ0Mygtem97ek'
export const kokoroString = 'jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13'

export type handleGenerateArticleProps = {
    form: any;
    user: any;
    clients: ApiClients;
    apiKey: string;
};

export async function bas64_It(path: string) {
    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    let audioBuffer;

    try {
        audioBuffer = Buffer.from(base64Audio, 'base64');
    } catch (error) {
        console.error('Error creating audio buffer:', error);
    }

    return audioBuffer;
}

export async function createArticleCategory(title: any, clients: ApiClients) {
    const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please give me a category for this title: ${title}. Respond with just the category name, no additional text.`,
        system_prompt: systemPromptChooseCategory,
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
    };

    try {
        const output = await clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
        let category = Array.isArray(output) ? output.join("") : String(output);
        category = category.trim().replace(/\s+/g, '');

        console.log('category', category)

        return {
            category,
            success: true,
            errorMessege: "",
        };
    } catch (error) {
        console.error("Error generating category:", error);
        return {
            category: "",
            success: false,
            errorMessege: "Error generating category"
        };
    }
}

export async function createArticleTitle(theQuery: string, user: any, clients: ApiClients) {
    const readioTitles = await sql`
      SELECT title FROM readios WHERE user_db_id = ${user?.user_db_id}
    `;

    const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 100,
        prompt: `Generate a short, rhythmic title using the Lotus Auto-Title Generator style. Here is a preview of the article: ${theQuery.substring(0, 100)}.
        Prioritize clarity + curiosity. The title should sound like the name of a chapter, short film, or spoken essay.
        Make sure it includes the topic or technique when relevant. Never use generic inspiration, clickbait, or vague poetry.
        Avoid poetic titles unless they clearly include the subject (person, concept, or metaphor).
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the title text
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's a title..." or "This title..."
        4. AGAIN, NO QUOTES!!!!!!!!!!!!!!!!!!! JUST GIVE THE TITLE.

        This title will be displayed inside of an app so it is important that you follow instructions.

        `,
        system_prompt: systemPromptForArticleTitle,
    };

    try {
        const output = await clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
        let title = Array.isArray(output) ? output.join("") : String(output);
        title = title.trim();

        console.log('title', title)

        return {
            title,
            success: true,
            errorMessege: "",
        };
    } catch (error) {
        console.error("Error generating title:", error);
        return {
            title: "",
            success: false,
            errorMessege: "Error generating title"
        };
    }
}

export async function checkForNSFWContent(articleTitle: string, clients: ApiClients) {
    const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 50,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Please check the following title for NSFW content: "${articleTitle}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the NSFW determination, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the NSFW content..." or "This is the NSFW content..."

        `,
        system_prompt: systemPromptNSFW,
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
    };

    try {
        const output = await clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
        const nsfw = Array.isArray(output) ? output.join("") : String(output);

        console.log('nsfw', nsfw)
        return {
            nsfw: nsfw.trim(),
            success: true,
        };
    } catch (error) {
        console.error("Error checking for NSFW content:", error);
        return {
            nsfw: "",
            success: false,
        };
    }
}

export async function createReplicateQuery(title: string, clients: ApiClients, articleText?: any) {
    const input = {
        top_k: 0,
        top_p: 0.95,
        temperature: 0.7,
        max_new_tokens: 2000,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt: `Your task is to create a detailed image prompt for Replicate's Photon model.
        The content is an article titled: "${title}"
        And a preview: "${articleText?.substring(0, 100)}"
        
        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the image prompt, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the image prompt..." or "This is the image prompt..."
        4. FOLLOW THE SYSTEM PROMPT which is this: ${systemPromptReplicateImageQuery}.
        `,
    };

    try {
        const output = await clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });
        const replicateQuery = Array.isArray(output) ? output.join("") : String(output);

        console.log('replicateQuery', replicateQuery)

        return {
            replicateQuery: replicateQuery.trim(),
            success: true,
            errorMessege: "",
        };
    } catch (error) {
        console.error("Error generating Replicate query:", error);
        return {
            replicateQuery: "",
            success: false,
            errorMessege: "Error generating Replicate query",
        };
    }
}

// Modified to accept clients parameter
export async function createArticleIllustration_Replicate(replicateQuery: string, clients: ApiClients) {
    try {
        const output = await clients.replicateClient.run("luma/photon-flash", {
            input: { prompt: replicateQuery }
        });

        let imageUrl = '';

        if (output && typeof output === 'object' && typeof (output as any).url === 'function') {
            imageUrl = await (output as any).url();
        } else {
            imageUrl = ''
        }

        if (imageUrl) {
            const imageUrlString = String(imageUrl);
            const quoteMark = `"`

            let finalImageUrl = imageUrlString;
            if (imageUrlString.startsWith(quoteMark) && imageUrlString.endsWith(quoteMark)) {
                finalImageUrl = imageUrlString.substring(1, imageUrlString.length - 1);
            }

            if (finalImageUrl && (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://'))) {

                console.log('finalImageUrl', finalImageUrl)
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

// Modified to accept clients parameter
export async function createArticleWithAi(theQuery: string, title: string, clients: ApiClients, serviceProvider: string) {
    let articleText = "";
    const systemPrompt = systemPromptForArticleGeneration;
    const userPrompt_replicate = `

        The topic is: ${theQuery}.
        The title for the article is: ${title}.

        IMPORTANT INSTRUCTIONS:
        1.  The article's text MUST use "Ellipsis-Based Pause Formatting". This means:
            *   Use ellipses (...) strategically to create natural pauses and flow than a comma JUST CAN'T DO.
            *   The goal is to mimic the rhythm of human speech, emphasizing reflective moments and transitions.
            *   Apply ellipses:
                a. At the end of key phrases to signal a brief pause.
                b. Sparingly, ensuring the text remains fluid and conversational.
                c. DO NOT FILL THE TEXT WITH ELLIPSIS. THE POINT IS TO MAKE IT SOUND LIKE A HUMAN IS READING IT. 
        2.  DO NOT use any Markdown formatting. This means NO bolding (no **text**), no headers (no ## Headers), no italics, etc. The ONLY formatting allowed is the ellipsis (...) and standard paragraph breaks (a single newline character between paragraphs).

        Here is a SHORT EXAMPLE of the desired "Ellipsis-Based Pause Formatting" and NO Markdown:
        Topic: The Joy of Reading
        Title: Unlocking Worlds: One Page at a Time

        Unlocking Worlds... One Page at a Time

        Reading is more than just decoding words on a page... it's an adventure. It allows us to travel to distant lands... meet fascinating characters... and explore ideas that challenge our perspectives. Each book... a new journey. Sometimes... a quiet reflection is needed... to truly absorb the meaning. This simple act... can profoundly shape our understanding of the world... and ourselves.

        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the article text, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the article..." or "This is the article..."

        Now, please write the article about "${theQuery}" with the title "${title}" following ALL the instructions above.
    `;
    const userPrompt_elevenLabs = `

        The topic is: ${theQuery}.
        The title for the article is: ${title}.

        IMPORTANT INSTRUCTIONS:
        1.  DO NOT use any Markdown formatting. This means NO bolding (no **text**), no headers (no ## Headers), no italics, etc. The ONLY formatting allowed is the ellipsis (...) and standard paragraph breaks (a single newline character between paragraphs).

        Here is a SHORT EXAMPLE of the desired formatting and NO Markdown:
        Topic: The Joy of Reading
        Title: Unlocking Worlds: One Page at a Time

        Unlocking Worlds... One Page at a Time

        Reading is more than just decoding words on a page... it's an adventure. It allows us to travel to distant lands, meet fascinating characters, and explore ideas that challenge our perspectives. Each book... a new journey. Sometimes... a quiet reflection is needed to truly absorb the meaning. This simple act can profoundly shape our understanding of the world... and ourselves.

        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY the article text, no additional text.
        2. NO explanations, NO commentary, NO quotes
        3. NO prefixes like "Here's the article..." or "This is the article..."
        4. Notice the ellipses are used to create natural pauses and flow, TASTEFULLY, NOT LIKE A COMMA.

        Now, please write the article about "${theQuery}" with the title "${title}" following ALL the instructions above.
    `

    try {
        const input = {
            top_k: 0,
            top_p: 0.95,
            temperature: 0.7,
            max_new_tokens: 1500,
            stop_sequences: "<|end_of_text|>,<|eot_id|>",
            prompt: serviceProvider === "replicate" ? userPrompt_replicate : userPrompt_elevenLabs,
            system_prompt: systemPrompt,
            prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        };

        const output = await clients.replicateClient.run("meta/meta-llama-3-8b-instruct", { input });

        if (Array.isArray(output)) {
            articleText = output.join("");
        } else if (typeof output === 'string') {
            articleText = output;
        } else {
            console.warn("Unexpected output format from Llama 3 with replicate.run. Expected array or string.");
            articleText = String(output);
        }

        articleText = articleText.trim();

        return {
            articleText: articleText,
            success: true,
            errorMessege: "",
        };

    } catch (error) {
        console.error("Error calling Replicate API with Llama 3:", error);
        return {
            articleText: "",
            success: false,
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
    duration?: number,
    articleIsNSFW?: boolean
) {

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

// Modified to accept clients parameter
export async function addArticleToAmazon(temp_Article_From_DB: any, audioBuffer: any, clients: ApiClients) {
    const s3Key = `${temp_Article_From_DB?.[0]?.id}.mp3`;
    const s3ImageKey = `${temp_Article_From_DB?.[0]?.id}.jpg`;
    const sourceImageUrl = temp_Article_From_DB?.[0]?.artwork;

    console.log('Starting AWS upload process...');
    console.log('Article ID:', temp_Article_From_DB?.[0]?.id);
    console.log('Source Image URL:', sourceImageUrl);

    let imageBufferForS3: Buffer;
    let imageContentType: string = 'image/jpeg';

    try {
        console.log('Fetching image from source URL...');
        const imageResponse = await ReactNativeBlobUtil.fetch('GET', sourceImageUrl);
        console.log('Image fetch response status:', imageResponse.respInfo.status);

        const contentTypeHeader = imageResponse.respInfo.headers['Content-Type'] || imageResponse.respInfo.headers['content-type'];
        if (contentTypeHeader) {
            imageContentType = contentTypeHeader;
        }
        console.log('Image content type:', imageContentType);

        const imageBase64 = await imageResponse.base64();
        imageBufferForS3 = Buffer.from(imageBase64, 'base64');
        console.log('Image converted to buffer successfully');

        console.log('Uploading audio to S3...');
        await clients.s3Client?.send(new PutObjectCommand({
            Bucket: "readio-audio-files",
            Key: s3Key,
            Body: audioBuffer,
            ContentEncoding: 'base64',
            ContentType: 'audio/mpeg',
        }));
        console.log('Audio upload successful');

        console.log('Uploading image to S3...');
        await clients.s3Client?.send(new PutObjectCommand({
            Bucket: "lotus-image-files",
            Key: s3ImageKey,
            Body: imageBufferForS3,
            ContentEncoding: 'base64',
            ContentType: imageContentType,
        }));
        console.log('Image upload successful');

    } catch (error) {
        console.error("Failed to fetch image or upload to S3:", error);
        console.error("Error details:", {
            articleId: temp_Article_From_DB?.[0]?.id,
            sourceImageUrl,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }

    const s3AudioUrl = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    const s3ImageUrl = `https://lotus-image-files.s3.us-east-2.amazonaws.com/${s3ImageKey}`;
    console.log('Generated S3 URLs:', { s3AudioUrl, s3ImageUrl });

    return { s3AudioUrl, s3ImageUrl };
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

// NOTE - FETCH AUDIO FROM REPLICATE AND RETURN FILE PATH =====================
export async function fetchAudioFromReplicateAndReturnFilePath(
    text: string,
    voice: string,
    clients: ApiClients
): Promise<any> {

    const input = {
        text: text,
        voice: voice,
        speed: 0.88,
    };


    try {
        const response = await clients.replicateClient.run(
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
        // console.log("Audio URL from Replicate:", audioUrl);

        // Download the file to local storage
        const localResponse = await ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'wav', // Use the same extension as the original file
        }).fetch('GET', audioUrl);

        const localPath = localResponse.path();
        // console.log("Local file path:", localPath);

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
    apiKey: string,
    user_role: string
): Promise<{ path: string; duration: number; success: boolean; errorMessege?: string }> {

    // Reconstruct 
    const accessKeyId = apiKey;

    const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': accessKeyId,
    };

    const requestBody = {
        text,
        voice_settings: { similarity_boost: 0.85, stability: 0.5, speed: 0.95 },
        model_id: user_role === "admin" ? "eleven_multilingual_v2" : "eleven_flash_v2"
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
            // console.log(`Audio duration: ${durationSeconds} seconds for path: ${localPath}`);
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
