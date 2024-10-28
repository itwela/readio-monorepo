import { neon } from '@neondatabase/serverless';
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "pexels";
import { ElevenLabsClient } from "elevenlabs";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export async function POST(request: Request) {

    const sql = neon(`${process.env.DATABASE_URL}`);
    const { title, topic, clerkId, username } = await request.json()

    try {
        const message = 'hi'
        const un = username

        // gemini -----------------------------------------------------------
        async function generateReadioGemini(history?: Message[]) {
           const model = google("models/gemini-1.5-flash-latest");
           const conversationHistory: Record<string, Message[]> = {};
         
           const systemPrompt = `
           You are a mechaninc in an app that generates short, intellegent articles based on any given topic. These articles 
           will be read aloud by ai after you generate them. The articles will be called Readios. Right now I want you to make the readios short. for testing purposes only 1 paragraph. 5 sentences max.
           `;
         
           console.log("system prompt: ", systemPrompt);
         
           const userPrompt = `
           Can you make me a readio about ${topic}
           `;
         
           console.log("user prompt: ", userPrompt);
         
           try {
             const { text } = await generateText({
               model: model,
               messages: [
                 { role: "system", content: systemPrompt },
                 { role: "user", content: userPrompt },
               ],
               temperature: 0.7,
               topP: 0.95,
               maxTokens: 500,
             });
         
             if (history) {
               conversationHistory[un].push(...history);
             }

             console.log("text: ", text);
         
             return {
               messages: history,
               newMessage: text,
               userId: clerkId,
               readioId: ''
             };

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

        if (!response.newMessage) {
            console.error('New message is undefined');
            return;
        }

        // END END END -----------------------------------------------------------------

        // Pexals ----------------------------------------------------------
        console.log("Starting Pexals....");
        const searchQuery = `${topic}`;
        const client = createClient(
            "WkMKeQt9mF8ce10jgThz4odFhWoR4LVdiXQSY8VVpekzd7hPNn4dpb5g"
        );
        let illustration = "";
        const pexalsResponse = await client.photos.search({
            query: `${searchQuery}`,
            per_page: 1,
          });
          if ("photos" in pexalsResponse && pexalsResponse.photos.length > 0) {
            illustration = pexalsResponse.photos[0].src.landscape;
        }
        console.log("Ending Pexals....");
        // END END END -----------------------------------------------------------------

        // ElevenLabs -------------------------------------------------------
        

        // END END END -----------------------------------------------------------------

        // database --------------------------------------------------------
        console.log("Starting Supabase....");
        const addReadioToDB = await sql`
        INSERT INTO readios (
            image,
            text, 
            topic,
            title,
            clerk_id,
            username
        )
        VALUES (
            ${illustration},
            ${response.newMessage},
            ${topic}, 
            ${title},
            ${clerkId},
            ${un}
        )
        RETURNING id;
        `;
        
        response.readioId = addReadioToDB[0].id;

        console.log("Ending Supabase....");


        console.log("returning response now....");
        return new Response(JSON.stringify({data: response}), {status: 201});
        // return new Response(audio as any, { headers: { "Content-Type": "audio/mpeg" } });
        
    } catch (error: any) {
        console.error("i was here", error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}
