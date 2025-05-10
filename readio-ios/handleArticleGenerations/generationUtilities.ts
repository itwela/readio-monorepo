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

        console.log('Raw output:', output);

        // Handle the function url() case specifically
        let imageUrl = '';

        if (output && typeof output === 'object' && typeof (output as any).url === 'function') {
            // If url is a function, call it
            imageUrl = await (output as any).url();
            console.log('Called url() function');
            console.log('Image URL:', imageUrl);
        } else {
            // Fallback to other formats
            imageUrl = ''
            console.log('No url() function found');
        }

        if (imageUrl) {

            // Remove surrounding quotes if present
            if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
                imageUrl = imageUrl.substring(1, imageUrl.length - 1);
                console.log('Removed quotes from URL:', imageUrl);
            }

            return {
                illustration: imageUrl,
                success: true,
                errorMessege: "",
            }

        } else {

            console.log('No image URL found');

        }

    } catch (error) {

        return {
            illustration: '',
            success: false,
            errorMessege: `${'There was an error generating the image from Replicate'} ${error}`,
        }

    }

    return {
        illustration: '',
        success: true,
        errorMessege: "",
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
    // Using a variable instead of useState for readioText
    let articleText = "";
    const promptForArticle = `Can you make me an article about ${theQuery}. The title is: ${title}.`;

    const output = await replicate.run(
        "google-deepmind/gemma-7b-it:2790a695e5dcae15506138cc4718d1106d0d475e6dca4b1d43f42414647993d5",
        {
            input: {
                top_k: 50,
                top_p: 0.95,
                prompt: promptForArticle,
                temperature: 0.7,
                max_new_tokens: 618,
                min_new_tokens: -1,
                repetition_penalty: 1
            }
        }
    );

    console.log(output);


    // OLD CHATGPT 4 IMPLEMENTATION - (ARCHIVED)
    // const completion = await chatgpt.chat.completions.create({
    //     model: "gpt-4o",
    //     messages: [
    //         { role: "developer", content: systemPromptForArticleGeneration },
    //         { role: "user", content: promptForArticle },
    //     ],
    // });

    // console.log(completion.choices[0].message);
    // articleText = completion.choices[0].message.content as string;
    // console.log("set article response response");

    return {
        articleText: articleText,
        success: true,
        errorMessege: "",
    }

}

export async function addArticleToDB(
    illustration: string,
    theArticleText: any,
    topic: string,
    user: any,
    title: string,
    artist: string,
) {
    // Save to database
    console.log("Starting Supabase....");
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

export async function addArticleToAmazon(temp_Article_From_DB: any, audioBuffer: any) {

    // Upload to S3
    const s3Key = `${temp_Article_From_DB?.[0]?.id}.mp3`;

    try {
        // Using AWS SDK v3 approach
        await s3.send(new PutObjectCommand({
            Bucket: "readio-audio-files",
            Key: s3Key,
            Body: audioBuffer,
            ContentEncoding: 'base64',
            ContentType: 'audio/mpeg',
        }));
        console.log("S3 upload successful");
    } catch (error) {
        console.error("Failed to upload audio to S3:", error);
    }

    // Update database with S3 URL
    const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;

    return s3Url;

}

export async function updateArticleToDb(amazon_article_url: string, temp_Article_From_DB: any, user: any) {

    await sql`
    UPDATE readios
    SET url = ${amazon_article_url}
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
        speed: 0.8,
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
): Promise<string> {
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
        throw new Error(`HTTP error! status: ${status}`);
    }

    return response.path();
}
