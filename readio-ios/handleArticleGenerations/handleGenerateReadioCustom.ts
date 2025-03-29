import sql from '@/helpers/neonClient';
import { Keyboard } from 'react-native';
import { geminiTitle, geminiPexals } from '@/helpers/geminiClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Buffer } from 'buffer';
import { s3 } from '@/helpers/s3Client';
import { accessKeyId, secretAccessKey } from '@/helpers/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { handleGenerateArticleProps } from './handleGenerateArticle';
import { replicate } from '@/helpers/replicateClient';
import { error } from 'console';

const kokoroString = 'jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13'

export async function handleGenerateArticleReplicate_Custom ({
  form,
  user,
}: handleGenerateArticleProps) {

  // This is my first test of adding replicate models into lotus.

  try {

    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(form?.query, form?.id);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
    
    const getTheTitle = await createArticleTitle(form, user);
    
    const title = getTheTitle?.title as string;
    
    const getThePexalQuery = await createPexalsQuery(title, form);
    
    const pexalQuery = getThePexalQuery?.pexalQuery as string;
    
    const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);

    const illustration = getTheIllustration?.illustration as string;

    const temp_Article_From_DB = await addArticleToDB(illustration, form, user, title, user?.name)
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
    
    const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

    return {
      success: true,
    }


  } catch (error) {
    console.error('Error in handleGenerateArticleReplicate_Custom:', error);
    return {
      success: false
    };
  }
};

export async function handleGenerateArticleElevenLabs_Custom ({
  form,
  user,
}: handleGenerateArticleProps)  {
 
  try {


    const getTheTitle = await createArticleTitle(form, user);
    const title = getTheTitle?.title as string;

    
    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      '',
      // TODO
      'bc2697930732a0ba97be1d90cf641035',
      "ri3Bh626mOazCBOSTIae"
    );
    const audioBuffer = await bas64_It(path);
    



    // const readioTitles = await sql`
    //   SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
    // `;

    // console.log("Starting Gemini...");
    // let title = "";
    // const promptTitle = `Please generate me a good title for this article. Here is a preview of the article: ${form?.query.substring(0, 100)}. Also, here are the titles of the articles I already have. ${readioTitles}. Please give me something new and not in this list.`;

    // try {
    //   const resultTitle = await geminiTitle.generateContent(promptTitle);
    //   const geminiTitleResponse = await resultTitle.response;
    //   const textTitle = geminiTitleResponse.text();
    //   if (textTitle.length > 0) {
    //     title = textTitle;
    //     console.log("set title response: ", title);
    //   }
    // } catch (error) {
    //   console.error("Error generating title:", error);
    // }

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
    // const path = await fetchAudioFromElevenLabsAndReturnFilePath(
    //   form?.query,
    //   'bc2697930732a0ba97be1d90cf641035',
    //   "ri3Bh626mOazCBOSTIae"
    // );

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    // let audioBuffer;

    try {
      // audioBuffer = Buffer.from(base64Audio, 'base64');
      console.log('Audio buffer created successfully');
    } catch (error) {
      console.error('Error creating audio buffer:', error);
    }


    // Upload to S3
    const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;

    try {
      // Using AWS SDK v3 approach
      await s3.send(new PutObjectCommand({
        Bucket: "readio-audio-files",
        Key: s3Key,
        Body: audioBuffer,
        ContentEncoding: 'base64',
        ContentType: 'audio/mpeg',
      }));
      console.log("S3 upload successful");
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
    console.error('Error in handleGenerateArticleElevenLabs_Custom:', error);
    return {
      success: false
    };
  }
};


// STUB -- Essential Utility Functions For Reliable Audio Generation ----

async function bas64_It(path: string) {

  const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
  let audioBuffer;

  try {
    audioBuffer = Buffer.from(base64Audio, 'base64');
    console.log('Audio buffer created successfully');
  } catch (error) {
    console.error('Error creating audio buffer:', error);
  }

  return audioBuffer;

}

async function createArticleTitle(form: any, user: any) {

  const readioTitles = await sql`
    SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
  `;

  console.log("Starting Gemini...");
  let title = "";
  const promptTitle = `Please generate me a good title for this article. Here is a preview of the article: ${form?.query.substring(0, 100)}. Also, here are the titles of the articles I already have. ${readioTitles}. Please give me something new and not in this list.`;

  try {
    const resultTitle = await geminiTitle.generateContent(promptTitle);
    const geminiTitleResponse = await resultTitle.response;
    const textTitle = geminiTitleResponse.text();
    if (textTitle.length > 0) {
      title = textTitle;
      console.log("set title response: ", title);
      return {
        title: title,
        success: true,
        errorMessege: "",
      }
    }
  } catch (error) {
    console.error("Error generating title:", error);
    return {
      title: "",
      success: false,
      errorMessege: "Error generating title"
    }
  }

}

async function createPexalsQuery (title: string, form: any) {
      // Generate Pexels query
      let pexalQuery = "";
      const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and a preview of the article is: ${form?.query.substring(0, 100)}.`;
  
      try {
        const resultPexals = await geminiPexals.generateContent(promptPexals);
        const geminiPexalsResponse = resultPexals.response;
        const textPexals = geminiPexalsResponse.text();
        pexalQuery = textPexals;
        console.log("set pexal response: ", pexalQuery);
        return {
          pexalQuery: pexalQuery,
          success: true,
          errorMessege: "",
        }
      } catch (error) {
        console.error("Error generating Pexels query:", error);
        return {
          pexalQuery: "",
          success: false,
          errorMessege: "Error generating Pexels query",
        }
      }
}

async function createArticleIllustration_Pexals(pexalQuery: string) {
  
  let illustration = "";

  const response = await pexelsClient.photos.search({
    query: pexalQuery,
    per_page: 1,
  });

  if (response && "photos" in response && response.photos?.length > 0) {
    illustration = response.photos[0].src.landscape;
    return {
      illustration: illustration,
      success: true,
      errorMessege: "",
    }
  } else {
    console.log("Couldn't find a cool image for you...");
    return {
      illustration: "",
      success: false,
      errorMessege: "Couldn't find a cool image for you...",
    }
  }

}

async function addArticleToDB(
  illustration: string,
  form: any,
  user: any,
  title: string,
  artist: string,
) {
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
        ${user?.name},
        ${artist},
        'default',
        0
      )
      RETURNING id, image, text, topic, title, clerk_id, username, artist, tag, upvotes;
    `;

  return addReadioToDB;
}

async function addArticleToAmazon(temp_Article_From_DB: any, audioBuffer: any) {

  // Upload to S3
  const s3Key = `${temp_Article_From_DB?.[0]?.id}.mp3`;

  try {
    // Using AWS SDK v3 approach
    await s3.send(new PutObjectCommand({
      Bucket: "readio-audio-files",
      Key: s3Key,
      Body: audioBuffer,
      ContentEncoding: 'base64',
      ContentType: 'audio/mpeg',
    }));
    console.log("S3 upload successful");
  } catch (error) {
    console.error("Failed to upload audio to S3:", error);
  }

  // Update database with S3 URL
  const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;

  return s3Url;

}

async function updateArticleToDb(amazon_article_url: string, temp_Article_From_DB: any, user: any) {

  await sql`
  UPDATE readios
  SET url = ${amazon_article_url}
  WHERE id = ${temp_Article_From_DB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
  RETURNING *;
`;

  return;

}

async function fetchAudioFromReplicateAndReturnFilePath(
  text: string,
  voice: string,
): Promise<any> {

  const input = {
    text: text,
    voice: voice,
  };

  try {
    const response = await replicate.run(
      kokoroString, { input }
    );

    if (!response) {
      return {
        path: "",
        success: false,
        errorMessege: "No response received from Replicate"
      }
    }

    if (typeof response !== 'object') {
      return {
        path: "",
        success: false,
        errorMessege: "Invalid response format: expected object"
      }
    }

    const audioUrl = response.toString();
    console.log("Audio URL from Replicate:", audioUrl);

    // Download the file to local storage
    const localResponse = await ReactNativeBlobUtil.config({
      fileCache: true,
      appendExt: 'wav', // Use the same extension as the original file
    }).fetch('GET', audioUrl);

    const localPath = localResponse.path();
    console.log("Local file path:", localPath);

    if (!localPath) {
      return {
        path: "",
        success: false,
        errorMessege: "Failed to save file locally"
      }
    }

    return {
      path: localPath,
      success: true
    }

  } catch (error) {
    console.error('Error in fetchAudioFromReplicateAndReturnFilePath:', error);
    throw error;
  }
}


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

// STUB --- END ---