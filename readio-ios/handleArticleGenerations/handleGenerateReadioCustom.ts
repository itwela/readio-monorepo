import sql from '@/helpers/neonClient';
import { Keyboard } from 'react-native';
import { geminiTitle, geminiPexals } from '@/helpers/geminiClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Buffer } from 'buffer';
import { s3 } from '@/helpers/s3Client';
import { accessKeyId, secretAccessKey } from '@/helpers/s3Client';

export type HandleGenerateReadioCustomProps = {
  form: any
  user: any;
};

export const handleGenerateReadioCustom = async ({
  form,
  user,
}: HandleGenerateReadioCustomProps) => {
  try {
   
    const readioTitles = await sql`
      SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
    `;

    console.log("Starting Gemini...");
    let title = "";
    const promptTitle = `Please generate me a good title for this readio. Here is a preview of the article: ${form?.query.substring(0, 100)}. Also, here are the titles of the readios I already have. ${readioTitles}. Please give me something new and not in this list.`;

    try {
      const resultTitle = await geminiTitle.generateContent(promptTitle);
      const geminiTitleResponse = await resultTitle.response;
      const textTitle = geminiTitleResponse.text();
      if (textTitle.length > 0) {
        title = textTitle;
        console.log("set title response: ", title);
      }
    } catch (error) {
      console.error("Error generating title:", error);
    }

    // Generate Pexels query
    let pexalQuery = "";
    const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and a preview of the article is: ${form?.query.substring(0, 100)}.`;
    
    try {
      const resultPexals = await geminiPexals.generateContent(promptPexals);
      const geminiPexalsResponse = await resultPexals.response;
      const textPexals = geminiPexalsResponse.text();
      pexalQuery = textPexals;
      console.log("set pexal response: ", pexalQuery);
    } catch (error) {
      console.error("Error generating Pexels query:", error);
    }

    let illustration = "";
    try {
      const response = await pexelsClient.photos.search({
        query: pexalQuery,
        per_page: 1,
      });

      if (response && "photos" in response && response.photos?.length > 0) {
        illustration = response.photos[0].src.landscape;
      } else {
        console.log("Couldn't find a cool image for you...");
      }
    } catch (error) {
      console.log(`Couldn't find a cool image for you... Error: ${error}`);
    }

    // Save to database
    console.log("Starting Supabase....");
    const addReadioToDB = await sql`
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
        ${form?.query},
        'Study', 
        ${title},
        ${user?.clerk_id},
        ${user?.fullName},
        ${user?.fullName},
        'default',
        0
      )
      RETURNING id, image, text, topic, title, clerk_id, username, artist, tag, upvotes;
    `;


    // Generate audio with ElevenLabs
    console.log("Starting ElevenLabs....");
    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      form?.query,
      'bc2697930732a0ba97be1d90cf641035',
      "ri3Bh626mOazCBOSTIae"
    );

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    let audioBuffer;

    try {
      audioBuffer = Buffer.from(base64Audio, 'base64');
      console.log('Audio buffer created successfully');
    } catch (error) {
      console.error('Error creating audio buffer:', error);
    }


    // Upload to S3
    const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;
    try {
      await s3.upload({
        Bucket: "readio-audio-files",
        Key: s3Key,
        Body: audioBuffer,
        ContentEncoding: 'base64',
        ContentType: 'audio/mpeg',
      }).promise();
    } catch (error) {
      console.error("Failed to upload audio to S3:", error);
    }

    
    // Update database with S3 URL
    const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    await sql`
      UPDATE readios
      SET url = ${s3Url}
      WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
      RETURNING *;
    `;

    return {
      success: true
    };

  } catch (error) {
    console.error('Error in handleGenerateReadioCustom:', error);
    return {
      success: false
    };
  }
};

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
    model_id: "eleven_flash_v2"
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