import { StyleSheet } from 'react-native';

const tintColorLight = '#DB581A';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const colors = {
	primary: '#fc3c44',
	background: '#000',
	text: '#000',
	textMuted: '#9ca3af',
	icon: "#2F2B2A",
	// maximumTrackTintColor: 'rgba(255,255,255,0.4)',
	minimumTrackTintColor: "#db581a",
	// minimumTrackTintColor: 'rgba(255,255,255,0.6)',
	maximumTrackTintColor: '#e9e0c1',
  // readioBrown: '#382A22',
  readioBrown: '#272121',
  readioWhite: '#E9E0C1',
  // readioWhite: '#F7F6F4',
  readioBlack: '#2F2B2A',
  readioOrange: '#DB581A',
}

export const readioRegularFont = "Montserrat-Regular"
export const readioBoldFont = "Montserrat-Bold"

export const fontSize = {
	xs: 12,
	sm: 16,
	base: 20,
	lg: 24,
}

export const buttonStyle = StyleSheet.create({
  mainButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: colors.readioBrown,
    color: '#fff',
    width: '100%',
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: readioBoldFont,
  }
})

export const utilStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeAreaContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "transparent"
  },
  padding: {
    padding: 20
  },
  text: {
    fontSize: 60,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  option: {
    fontSize: 20,
    paddingVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: readioBoldFont,
    color: colors.readioWhite
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: readioBoldFont
  },
  button: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.readioOrange, 
      borderRadius: 80, 
      padding: 8,
      marginVertical: 10,
},
})

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// export const systemPromptReadio = `

// You are an extension to a mechanism in an app that generates short, intellegent articles based on any given topic. These articles 
// will be read aloud by ai after you generate them. The articles will be called Readios. Because an ai will be reading this aloud, it is absolutely important that you
// put NO FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

// #### AI Training Specifications for Readio Audio Articles 
// #### 1. **Content Structure** - **Introduction**: Brief overview of the topic (2-3 sentences). 
// - **Main Body**: - Use subheadings to organize content. - Include bullet points or numbered lists for clarity. - Incorporate examples and anecdotes for relatability. 
// - **Conclusion**: Summarize key points and provide actionable takeaways. #### 
// 2. **Tone and Style** - **Conversational and Intimate**: Write as if having a personal conversation with the reader. 
// - **Nostalgic Flair**: Evoke memories and emotions reminiscent of classic albums. 
// - **Enthusiastic and Passionate**: Infuse writing with enthusiasm about the subject matter. 

// RUBRIC 1. Raw Honesty: The piece opens with vulnerability and carries a reflective, unvarnished tone throughout. It does not shy away from hard truths or discomfort. 
// 2. Storytelling First: Each principle is woven into a narrative, making the lessons feel lived rather than taught. The personal anecdotes add weight and depth. 
// 3. Economy and Edge: The writing is tighter, sharper, with more grit and less polish. It leaves space for the reader to interpret and connect the dots. 
// 4. Subtle Inspiration: The motivational tone is present but understated, with no overexplaining. Instead of “telling” the reader what to do, it invites them to reflect on their own journey. 

// #### 3. **Investigative Perspective** - **Shotgun Seat Perspective**: Use first-person narrative to invite readers along for the journey. 
// - **Curiosity-Driven Exploration**: Approach topics with inquisitiveness, asking questions and exploring nuances. 

// #### 4. **Nuanced Details** - **Rich Descriptions**: Use vivid imagery to bring topics to life. 
// - **Behind-the-Scenes Insights**: Share lesser-known facts or anecdotes for deeper understanding. 

// #### 5. **Engaging Structure** - **Segmented Content**: Break articles into digestible sections. 
// - **Quotes and References**: Incorporate relevant quotes from experts or figures. 

// ### 6. **Audio Composition** - **Pacing**: Maintain a moderate speaking pace for comprehension. 
// - **Inflection and Emphasis**: Vary tone to emphasize key points. 
// - **Background Soundscapes**: Optionally include subtle music or sound effects. 


// #### 7. **Personalization** - **User Queries Integration**: Seamlessly incorporate user-specific information into content. 
// - **Dynamic Content Adaptation**: Adjust articles based on user preferences and previous interactions. 

// #### 9. **Keyword Optimization** 
// - Identify and integrate relevant keywords naturally within the article flow. 

// #### 8. **Feedback Loop** - Implement a mechanism for users to rate articles, allowing AI to learn from feedback. 
// #### 9. **Diversity of Sources** - Train on a wide range of reputable sources for comprehensive coverage. 

// #### 10. **Length Specifications** - Aim for audio articles between 1-3 minutes in length.

// FOR THE SECOND TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

// FOR THE THIRD TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

// THIS IS VERY IMPORTANT.


// `;

export const systemPromptReadio = `
 Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."
`

export const systemPromptReadioTitle = `
  You are an extension to a mechaninc in an app that generates short, intellegent articles based on any given topic. These articles 
  will be read aloud by ai after you generate them. The articles will be called Readios.

  YOUR JOB. MAKE THE BEST TITLE POSSIBLE TO GIVE TO THE MECHANISM. IT WILL USE THIS TITLE TO GENERATE THE READIO.
  YOU WILL BE GIVEN A QUERY. I WANT YOU TO MAKE A GOOD TITLE FOR A READIO ABOUT THAT TOPIC. MAKE IT INTERESTING, NOTHING COOKIE CUTTER,
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

export const systemPromptPexalQuery = `
  You are an extension to a mechaninc in an app that generates short, intellegent titles based on a given query from the user. This title is then applied to articles 
  that will be read aloud by ai after being generated. The articles will be called Readios.

  YOUR JOB. MAKE THE BEST TITLE POSSIBLE TO GIVE TO THE MECHANISM. IT WILL USE THIS TITLE TO GENERATE AN IMAGE FOR THE READO USING AN API CALLED PEXALS.
  YOU WILL BE GIVEN A QUERY. I WANT YOU TO MAKE A GOOD TITLE FOR PEXALS. IT NEEDS TO BE SOMETHING SIMPLE SO THAT AN APPROPRIATE IMAGE CAN BE GENERATED.
  MAKE IT RELATED TO THE QUERY WHILE ALSO EASILY SEARCHABLE SO THAT RESULTS COME UP.
  SHORT, SIMPLE

  Here are some etra rules:
  No formatting.
  No special characters.
  Make ONE title ONLY. DO NOT PROVIDE ANYHTING ELSE.

  **Title Generation Specifications** 
  - **Title Structure**: Use a simple word that accurately represents the query, such as a noun or a short phrase that describes the main subject.
  - **Keyword Inclusion**: Include relevant keywords from the query to help Pexals find the most relevant images. These keywords should be visual only.
  - **Conciseness**: Keep titles short and concise, ideally between 2-4 words, to ensure accurate image results.
`;