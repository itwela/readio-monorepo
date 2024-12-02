import { google } from "@ai-sdk/google";
import { DefaultNavigator } from "expo-router/build/views/Navigator";

const gemini = google("models/gemini-1.5-flash-latest");

export default gemini

