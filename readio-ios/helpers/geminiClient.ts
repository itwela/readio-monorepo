// import { google } from "@ai-sdk/google";
import { DefaultNavigator } from "expo-router/build/views/Navigator";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { google } from "@ai-sdk/google";
import Constants from 'expo-constants';

// Validate that all dummy parts exist
if ( !Constants.expoConfig?.extra?.GOOGLE_GENERATIVE_AI_API_KEY_1 || !Constants.expoConfig?.extra?.GOOGLE_GENERATIVE_AI_API_KEY_2 ) {
    throw new Error("Google Generative AI credentials not found in expo config");
}

// Extract dummy parts and salt from Expo config
const extra = Constants.expoConfig.extra;

const googleApiKeyParts = [
    extra.GOOGLE_GENERATIVE_AI_API_KEY_1,
    extra.GOOGLE_GENERATIVE_AI_API_KEY_2,
];

const reconstructKey = (parts: string[]) => parts.join("");

const googleApiKey = reconstructKey(googleApiKeyParts);

const creatGeminiClient = createGoogleGenerativeAI({
    // custom settings
    apiKey: googleApiKey,
});

const gemini = google("models/gemini-1.5-flash-latest");


export default gemini