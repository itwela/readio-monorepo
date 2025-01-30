// import { google } from "@ai-sdk/google";
import { DefaultNavigator } from "expo-router/build/views/Navigator";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { google } from "@ai-sdk/google";
import Constants from 'expo-constants';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { systemPromptPexalQuery, systemPromptReadio, systemPromptReadioTitle, systemPromptAdmin, systemPromptChooseCategory } from "@/constants/tokens";

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

const reconstructKey = (parts: string[]) => {
    console.log(parts);
    return parts.join("");
};

export const googleApiKey = reconstructKey(googleApiKeyParts);

// const geminiProvider = createGoogleGenerativeAI({
//     apiKey: googleApiKey,
// });

// const gemini = geminiProvider("gemini-1.5-flash", {
//     useSearchGrounding: true,
// });


export const genAI = new GoogleGenerativeAI(googleApiKey);

export const geminiTest = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: `Im just testing if you are overloaded. Respond with the word "Hello" and Hello only, if you are there.`
})

export const geminiTitle = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-8b",
    systemInstruction: systemPromptReadioTitle
 });

export const geminiCategory = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-8b",
    systemInstruction: systemPromptChooseCategory
});

export const geminiReadio = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: systemPromptReadio
 })

export const geminiPexals = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: systemPromptPexalQuery
 })

export const geminiAdmin = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: systemPromptAdmin
})
// export const model = "gemini-1.5-flash"