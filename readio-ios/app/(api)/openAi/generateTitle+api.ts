import { google } from "@ai-sdk/google";
import { generateText } from "ai";
// import gemini from "@/helpers/geminiClient";
import { createClient } from "pexels";
import { ElevenLabsClient } from "elevenlabs";
import sql from "@/helpers/neonClient";
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export async function POST(request: Request) {

    const { top, mode } = await request.json()
    console.log("server top: ", top);

    try {
        const message = 'hi'

        // gemini -----------------------------------------------------------
        async function generateReadioGemini(history?: Message[]) {
          //  const ai = gemini
           const conversationHistory: Record<string, Message[]> = {};
         
           const systemPrompt = `
           You are an extension to a mechaninc in an app that generates short, intellegent articles based on any given topic. These articles 
           will be read aloud by ai after you generate them. The articles will be called Readios.

           YOUR JOB. MAKE THE BEST TITLE POSSIBLE TO GIVE TO THE MECHANIC. IT WILL USE THIS TITLE TO GENERATE THE READIO.
           YOU WILL BE GIVEN A TOPIC. I WANT YOU TO MAKE A GOOD TITLE FOR A READIO ABOUT THAT TOPIC. MAKE IT INTERESTING, NOTHING COOKIE CUTTER,
           SHORT, SIMPLE, AND MOST OF ALL, SOMETHING INTERESTING FOR THE END USER.

           Here are some etra rules:
           No formatting.
           No special characters.
           Make ONE title ONLY. DO NOT PROVIDE ANYHTING ELSE.
          
           **Title Generation Specifications** 
           - **Title Structure**: Combine user queries/interests with engaging hooks (e.g., "Unlocking [Interest]: [Catchy Phrase]"). 
           - **Engaging Hooks**: Use power words, ask questions, or create lists to attract attention. 
           - **Conciseness**: Keep titles between 6-12 words, avoiding jargon. 
           `;
         
           console.log("system prompt: ", systemPrompt);
         
           const userPrompt = `
           Please generate me a good title for a readio about ${top}
           `;
         
           console.log("user prompt: ", userPrompt);
         
           try {
          //    const { text } = await generateText({
          //      model: gemini,
          //      messages: [
          //        { role: "system", content: systemPrompt },
          //        { role: "user", content: userPrompt },
          //      ],
          //      temperature: 0.95,
          //      maxTokens: 500,
          // });
         
          //   //  if (history) {
          //   //    conversationHistory[message].push(...history);
          //   //  }

          //    console.log("text: ", text);
         
          //    return {
          //     //  messages: history,
          //      newMessage: text,
          //      readioId: ''
          //    };

           } catch (error) {

             console.error('Unexpected error:', error);
             return {
               messages: history,
               newMessage: `I'm sorry, but I'm having trouble responding right now. Can you please try again?`,
               type: "message",
             };
           }
        }
        const response = await generateReadioGemini()

        // if (!response.newMessage) {
        //     console.error('New message is undefined');
        //     return;
        // }

        // END END END -----------------------------------------------------------------
        console.log("returning response now....");
        return new Response(JSON.stringify({data: response}), {status: 201});
        // return new Response(audio as any, { headers: { "Content-Type": "audio/mpeg" } });
        
    } catch (error: any) {
        console.error("i was here", error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}
