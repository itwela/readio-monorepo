/*
----- 🛜 ------
FIX: The handleGenerateArticleCompletelyFree function was not working because useProgressQueue is a React hook
that can only be used within React components. To fix this, we need to initialize ProgressQueue outside
the function and pass it as a parameter. No other code, styles or functionality were modified.
All commented code is preserved exactly as it was.
*/

import sql from '@/helpers/neonClient';
import { useProgressQueue } from './processingQueue';
import { GenerativeModel } from '@google/generative-ai';
import { createClient } from 'pexels';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Buffer } from 'buffer';
import { S3 } from 'aws-sdk';
import { chatgpt } from '@/helpers/openAiClient';
import { Keyboard } from 'react-native';
import { systemPromptReadio } from '@/constants/tokens';
import { geminiPexals, geminiCategory, geminiTitle } from '@/helpers/geminiClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { s3 } from '@/helpers/s3Client';

export type handleGenerateArticleCompletelyFreeProps = {
  form: any;
  user: any;
  setGenerationStarted: (value: boolean) => void;
  setProgressMessage: (message: string) => void;
  setArticleGenerationStatus: (status: string) => void;
  progress?: any;
};

export const handleGenerateArticleCompletelyFree = async ({
  form,
  user,
  setGenerationStarted,
  setProgressMessage,
  setArticleGenerationStatus,
  progress,
}: handleGenerateArticleCompletelyFreeProps) => {

  progress?.resetQueue();
  progress?.resetQueue();
  Keyboard.dismiss();

  progress?.updateProgress("INITIAL_ZERO");

  setGenerationStarted(true);
  setProgressMessage("We're creating your article...");

  // NOTE generate a title with ai ------------------------------------------------
  const readioTitles = await sql`
    SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
  `;

  console.log("Starting Gemini...");

  // Using a variable instead of useState for title
  let title = "";
  console.log("Starting Gemini...title");
  const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${form.query}. Also, here are the titles of the articles I already have. ${readioTitles}. Please give me something new and not in this list.`;
  const resultTItle = await geminiTitle.generateContent(promptTitle);
  const geminiTitleResponse = await resultTItle.response;
  const textTitle = geminiTitleResponse.text();
  title = textTitle;
  console.log("set title response: ", title);

  progress?.updateProgress("PROCESSING_TWO");

  let category = "";
  const promptCategory = `Please give me a category for this title: ${title}.`;
  const resultCategory = await geminiCategory.generateContent(promptCategory);
  const geminiCategoryResponse = await resultCategory.response;
  const textCategory = geminiCategoryResponse.text();
  category = textCategory.replace(/\s+/g, '');
  console.log("set category response: ", category);

  progress?.updateProgress("HALFWAY_THREE");

  // Using a variable instead of useState for readioText
  let readioText = "";
  const promptReadio = `Can you make me a readio about ${form.query}. The title is: ${title}.`;

  const completion = await chatgpt.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "developer", content: systemPromptReadio },
      { role: "user", content: promptReadio },
    ],
  });

  console.log(completion.choices[0].message);
  readioText = completion.choices[0].message.content as string;
  console.log("set readio response: ", readioText);

  progress?.updateProgress("MIDWAY_FOUR");

  // Using a variable instead of useState for pexalQuery
  let pexalQuery = "";
  const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and the query that was asked in the first prompt was: ${form.query}.`;
  const resultPexals = await geminiPexals.generateContent(promptPexals);
  const geminiPexalsResponse = await resultPexals.response;
  const textPexals = geminiPexalsResponse.text();
  pexalQuery = textPexals;
  console.log("set pexal response: ", pexalQuery);

  // NOTE Pexals ----------------------------------------------------------
  console.log("Starting Pexals....");
  const searchQuery = `${pexalQuery}`;
  let illustration = "";
  await pexelsClient.photos
    .search({
      query: `${searchQuery}`,
      per_page: 1,
    })
    .then((response) => {
      if (response && "photos" in response && response.photos?.length > 0) {
        illustration = response.photos[0].src.landscape;
        setProgressMessage("Found a cool image for you...");
      } else {
        setProgressMessage("Couldn't find a cool image for you...");
      }
    })
    .catch((error) => {
      console.error("Error fetching from Pexals:", error);
      setProgressMessage("Couldn't find a cool image for you...");
    });

  // NOTE database --------------------------------------------------------
  console.log("Starting Supabase....");

  // default
  const addReadioToDB: any = await sql`
    INSERT INTO readios (
      image,
      text, 
      topic,
      title,
      clerk_id,
      username,
      artist,
      tag,
      upvotes
    )
    VALUES (
      ${illustration},
      ${readioText},
      ${category as string}, 
      ${title},
      ${user?.clerk_id},
      ${user?.fullName},
      'Lotus',
      'default',
      0
    )
    RETURNING id, image, text, topic, title, clerk_id, username, artist;
  `;

  console.log("addReadioToDB: ", addReadioToDB);
  console.log("Ending Supabase....");

  progress?.updateProgress("ADVANCED_FIVE");

  // NOTE elevenlabs --------------------------------------------------------
  console.log("Starting ElevenLabs....");

  async function fetchAudioFromElevenLabsAndReturnFilePath(
    text: string,
    apiKey: string,
    voiceId: string,
  ): Promise<string> {
    const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    const headers = {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    };

    const requestBody = {
      text,
      voice_settings: { similarity_boost: 0.5, stability: 0.5 },
      model_id: "eleven_flash_v2",
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

  const path = await fetchAudioFromElevenLabsAndReturnFilePath(
    readioText,
    // a_____________________k___e___e
    'bc2697930732a0ba97be1d90cf641035',
    // voice id
    "ri3Bh626mOazCBOSTIae",
  );
  console.log("path: ", path);

  console.log("Ending ElevenLabs....");
  const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
  const audioBuffer = Buffer.from(base64Audio, 'base64');
  console.log("audioBuffer: ", audioBuffer.length);

  progress?.updateProgress("NEAR_COMPLETE_SIX");
  setProgressMessage("Almost done...");

  // Upload the audio file to S3
  const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;
  console.log("s3Key line done");

  try {
    await s3
      .upload({
        Bucket: "readio-audio-files",
        Key: s3Key,
        Body: audioBuffer,
        ContentEncoding: 'base64',
        ContentType: 'audio/mpeg',
      })
      .promise();
    console.log("s3Key uploaded: ");
  } catch (error) {
    console.error("Failed to upload audio to S3:", error);
    progress?.resetQueue();
    setProgressMessage("There was an error, please try again. ");
    return;
  }

  const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
  console.log("S3 URL: ", s3Url);

  // NOTE database -------------------------------------------------------- 
  const response = await sql`
    UPDATE readios
    SET url = ${s3Url}
    WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
    RETURNING *;
  `;

  console.log("Audio successfully uploaded to S3 and path saved to the database.");

  setProgressMessage("Check your library to hear your article ✅.");

  setTimeout(() => {
    progress?.resetQueue();
    setArticleGenerationStatus('done');
  }, 1500);
};