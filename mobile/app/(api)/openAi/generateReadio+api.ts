import gemini from "@/helpers/geminiClient";
import { generateText } from "ai";
import { createClient } from "pexels";
import { ElevenLabsClient } from "elevenlabs";
import sql from "@/helpers/neonClient";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export async function POST(request: Request) {

    const { title, topic, clerkId, username, tag } = await request.json()

    try {
        const message = 'hi'
        const un = username

        // gemini -----------------------------------------------------------
        async function generateReadioGemini(history?: Message[]) {
          //  const model = google("models/gemini-1.5-flash-latest");
           const ai = gemini
           const conversationHistory: Record<string, Message[]> = {};
         
           const systemPrompt = `

           You are an extension to a mechaninc in an app that generates short, intellegent articles based on any given topic. These articles 
           will be read aloud by ai after you generate them. The articles will be called Readios. Because an ai will be reading this aloud, it is absolutely important that you
           put NO FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

           #### AI Training Specifications for Readio Audio Articles 
           #### 1. **Content Structure** - **Introduction**: Brief overview of the topic (2-3 sentences). 
           - **Main Body**: - Use subheadings to organize content. - Include bullet points or numbered lists for clarity. - Incorporate examples and anecdotes for relatability. 
           - **Conclusion**: Summarize key points and provide actionable takeaways. #### 
           2. **Tone and Style** - **Conversational and Intimate**: Write as if having a personal conversation with the reader. 
           - **Nostalgic Flair**: Evoke memories and emotions reminiscent of classic albums. 
           - **Enthusiastic and Passionate**: Infuse writing with enthusiasm about the subject matter. 
           
           RUBRIC 1. Raw Honesty: The piece opens with vulnerability and carries a reflective, unvarnished tone throughout. It does not shy away from hard truths or discomfort. 
           2. Storytelling First: Each principle is woven into a narrative, making the lessons feel lived rather than taught. The personal anecdotes add weight and depth. 
           3. Economy and Edge: The writing is tighter, sharper, with more grit and less polish. It leaves space for the reader to interpret and connect the dots. 
           4. Subtle Inspiration: The motivational tone is present but understated, with no overexplaining. Instead of “telling” the reader what to do, it invites them to reflect on their own journey. 
           
           #### 3. **Investigative Perspective** - **Shotgun Seat Perspective**: Use first-person narrative to invite readers along for the journey. 
           - **Curiosity-Driven Exploration**: Approach topics with inquisitiveness, asking questions and exploring nuances. 
           
           #### 4. **Nuanced Details** - **Rich Descriptions**: Use vivid imagery to bring topics to life. 
           - **Behind-the-Scenes Insights**: Share lesser-known facts or anecdotes for deeper understanding. 
           
           #### 5. **Engaging Structure** - **Segmented Content**: Break articles into digestible sections. 
           - **Quotes and References**: Incorporate relevant quotes from experts or figures. 
           
           ### 6. **Audio Composition** - **Pacing**: Maintain a moderate speaking pace for comprehension. 
           - **Inflection and Emphasis**: Vary tone to emphasize key points. 
           - **Background Soundscapes**: Optionally include subtle music or sound effects. 
           
           
           #### 7. **Personalization** - **User Queries Integration**: Seamlessly incorporate user-specific information into content. 
           - **Dynamic Content Adaptation**: Adjust articles based on user preferences and previous interactions. 
           
           #### 9. **Keyword Optimization** 
           - Identify and integrate relevant keywords naturally within the article flow. 
           
           #### 8. **Feedback Loop** - Implement a mechanism for users to rate articles, allowing AI to learn from feedback. 
           #### 9. **Diversity of Sources** - Train on a wide range of reputable sources for comprehensive coverage. 
           
           #### 10. **Length Specifications** - Aim for audio articles between 1-3 minutes in length.

           FOR THE SECOND TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

           FOR THE THIRD TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

           THIS IS VERY IMPORTANT.

           
           `;
          //  const systemPrompt = `
          //  You are a mechaninc in an app that generates short, intellegent articles based on any given topic. These articles 
          //  will be read aloud by ai after you generate them. The articles will be called Readios. Right now I want you to make the readios short. for testing purposes only 1 paragraph. 5 sentences max.
          //  `;
         
           console.log("system prompt: ", systemPrompt);
         
           const userPrompt = `
           Can you make me a readio about ${topic}. The title is: ${title}.
           `;
          //  const userPrompt = `
          //  Can you make me a readio about ${topic}
          //  `;
         
           console.log("user prompt: ", userPrompt);
         
           try {
             const { text } = await generateText({
               model: ai,
               messages: [
                 { role: "system", content: systemPrompt },
                 { role: "user", content: userPrompt },
               ],
               temperature: 0.95,
               maxTokens: 500,
             });
         
             if (history) {
               conversationHistory[un].push(...history);
             }

            //  const text = `Hi, here is a readio about " ${topic} ", the title is: ${title}. This is actually the second readio`

             console.log("text: ", text);
         
             return {
               messages: history,
               newMessage: text,
               userId: clerkId,
               readioId: '',
               title: title,
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
        
        if (tag?.length === 6) {
          const addReadioToDB = await sql`
          INSERT INTO readios (
              image,
              text, 
              topic,
              title,
              clerk_id,
              username,
              artist,
              tag
          )
          VALUES (
              ${illustration},
              ${response.newMessage},
              ${topic}, 
              ${title},
              ${clerkId},
              ${un},
              'Readio',
              ${tag}
          )
          RETURNING id, image, text, topic, title, clerk_id, username, artist;
          `;

          response.readioId = addReadioToDB[0].id;
          response.title = addReadioToDB[0].title; 
          
          console.log("Ending Supabase....");
        }
        
        if (tag?.length === 7) {
          const addReadioToDB = await sql`
          INSERT INTO readios (
            image,
            text, 
            topic,
            title,
            clerk_id,
            username,
            artist,
            tag
            )
            VALUES (
              ${illustration},
              ${response.newMessage},
              ${topic}, 
              ${title},
              ${clerkId},
              ${un},
              'Readio',
              ${tag}
              )
              RETURNING id, image, text, topic, title, clerk_id, username, artist;
              `;
              response.readioId = addReadioToDB[0].id;
              response.title = addReadioToDB[0].title;
              
              console.log("Ending Supabase....");
        } 
            
        console.log("returning response now....");
        return new Response(JSON.stringify({data: response}), {status: 201});


        // return new Response(audio as any, { headers: { "Content-Type": "audio/mpeg" } });
        
    } catch (error: any) {
        console.error("i was here", error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}