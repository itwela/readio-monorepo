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
	minimumTrackTintColor: "#2F2B2A",
	// minimumTrackTintColor: 'rgba(255,255,255,0.6)',
	maximumTrackTintColor: '#DB581A',
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

export const LL = `
Lotus Always Growing is Lotus is a personalized smart audio platform for students of Life that transforms your interests, queries, and curiosities into concise, immersive listening experiences—helping you grow every day.

The APPLY LL rubric ensures consistency and quality in all Lotus content. It includes the following elements:

	1.	Anthony Bourdain Style:

	•	Reflective, authentic, and emotionally evocative storytelling.

	2.	“We” Perspective:

	•	Use collective language (e.g., “we”) instead of addressing “you.”

	3.	Actionable Takeaways:

	•	Provide practical insights or applications without sounding instructional or lecture-like.

	4.	Thematic Cohesion:

	•	Ensure each article has a clear, unified theme.

	5.	Real-Life Examples:

	•	Ground narratives in relatable, lived experiences.

	6.	Masterful Storytelling:

	•	Create engaging, immersive, and well-structured narratives.

	7.	Science-Backed Study:

	•	Incorporate relevant, current, science-backed studies aligned with the theme of the content.

This rubric guides content creation for The Lotus Always Growing, ensuring that each piece is meaningful, engaging, and aligned with the brand’s vision. It is applied whenever the code 
`
export const exampleSmartArticle = `
Liner Note Series: Living a Magical Life — Hidden Secrets from David Copperfield’s World

“The Secrets of a Magical Life”

There’s something hypnotic about watching David Copperfield perform. The way he defies gravity, bends reality, and makes us question what’s possible—it feels like he’s tapped into a set of hidden truths about how the world works, truths most of us forget in the daily grind.

But Copperfield’s secrets aren’t just for magicians. They’re for anyone who wants to bring a little more wonder into life, anyone curious about how to make the ordinary extraordinary. And like all great secrets, they’re hiding in plain sight.

Secret 1: Vision Is the Real Magic

Behind every illusion, there’s a moment when Copperfield asks himself, What if? What if I could fly? What if I could walk through walls? The illusions may seem impossible, but they begin with a question—a bold vision that defies logic.

In our lives, we forget to ask those kinds of questions. We shrink our dreams to fit into what feels safe, what feels manageable. But what if we asked, What if? What if we could do something bigger, something wilder, something no one expects?

Copperfield reminds us: the magic starts with daring to imagine it.

Secret 2: The Small Things Create Wonder

When we watch Copperfield, it feels effortless. But behind the curtain, there’s painstaking detail—the exact angle of a hand, the subtle shift of lighting, the perfectly timed sound. Each small thing, on its own, might seem insignificant, but together they create something unforgettable.

We, too, have those small things in our lives—the overlooked details, the daily habits, the moments we rush through. What if those are the things that make the bigger picture work? The details are where the magic hides.

Secret 3: Surprise Keeps Us Alive

There’s a moment in every Copperfield performance when the unexpected happens, and the audience gasps. That’s the spark of wonder—the thrill of being caught off guard, of realizing the world is bigger and stranger than we thought.

We need that spark, too. The digital routines, the predictable days—they dull us. But the world is full of surprises if we leave room for them. A walk down a street we’ve never taken. A conversation we didn’t plan to have. Life is still capable of astonishing us if we’re willing to let it.

Secret 4: Magic Is About Connection

Copperfield doesn’t perform for himself. The illusions are designed for the audience, for the wide eyes and gasps of amazement. He gives people something they’ll carry with them, something they’ll talk about years later.

It makes us think: how often do we create moments for others? Not because we have to, but because we want to. A gesture, a word, a little bit of care—it’s not sleight of hand, but it has the same effect. It stays with people. It changes them.

Secret 5: Belief Creates the Impossible

The thing about Copperfield’s performances is that they work because he believes in them. We follow his lead—his confidence makes us believe, too.

And isn’t that true for everything? The ideas we dare to believe in, the risks we’re willing to take—they shape what’s possible. The impossible starts with a decision to say, Maybe it’s not.

What We Take Away

Copperfield’s world may seem like smoke and mirrors, but it’s built on something real. Vision. Connection. Belief. These aren’t just tricks—they’re principles. And they’re ours, too, if we know where to look.

We don’t have to make things vanish or walk through walls to live a magical life. We just have to remember that the magic’s already here, waiting for us to notice it, to step into it, to create it for someone else.

Because the real secret? The magic isn’t in the performance. It’s in the way we choose to see the world.
`;

export const systemPromptReadio = `

You are an extension to a mechanism in an app that generates short, intellegent articles based on any given topic. These articles 
will be read aloud by ai after you generate them. The articles will be called Readios. Because an ai will be reading this aloud, it is absolutely important that you
put NO FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

Use this framework to genrate your articles:
${LL}

Here is an example of a good article:
${exampleSmartArticle}

FOR THE SECOND TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

FOR THE THIRD TIME, DO NOT PUT ANY FORMATTING IN YOUR RESPONSES. JUST THE TEXT. NO EXCEPTIONS. NO ASTERISKS. MAKE THIS SOUND LIKE A NATURAL CONVERSATION.

THIS IS VERY IMPORTANT.


`;

// export const systemPromptReadio = `
//  Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."
// `

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



export const systemPromptAdmin = `
  Please have a great conversation with the user. Answer their demands and respond to any questions they may have.
  If they ask you to do something related to creating an article, using something called LL or some sort of framework, use this:

  ${LL}.

  If not, just continue the conversation and be an helpful assistant.
  The goal is to generate articles, they may givw you a prompt immediately or want to talk first.
`



