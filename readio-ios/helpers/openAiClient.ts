import OpenAI from 'openai';
import Constants from 'expo-constants';
import { systemPromptAdmin } from '@/constants/tokens';

// Validate that all dummy parts exist
if ( !Constants.expoConfig?.extra?.OPENAI_API_KEY_1 || !Constants.expoConfig?.extra?.OPENAI_API_KEY_2 || !Constants.expoConfig?.extra?.OPENAI_API_KEY_3 ) {
    throw new Error("Open AI credentials not found in expo config");
}

// Extract dummy parts and salt from Expo config
const extra = Constants.expoConfig.extra;

const openAiKeyParts = [
    extra.OPENAI_API_KEY_1,
    extra.OPENAI_API_KEY_2,
    extra.OPENAI_API_KEY_3,
];

const reconstructKey = (parts: string[]) => {
    console.log(parts);
    return parts.join("");
};

export const googleApiKey = reconstructKey(openAiKeyParts);


export const chatgpt = new OpenAI({
    apiKey: googleApiKey,
});
  
// Function to start or continue a conversation
export async function chatgptLotusArticles(messages: any) {
    try {
        const chatCompletion = await chatgpt.chat.completions.create({
            model: 'gpt-4', // Use a supported model like gpt-4 or gpt-3.5-turbo
            messages: [
                {
                    role: "system",
                    content: systemPromptAdmin, // Ensure this is a plain string
                },
                ...messages, // Ensure all messages here are objects with role and content as strings
            ],
        });
        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        console.error("Error during OpenAI chat:", error);
        throw error;
    }
}