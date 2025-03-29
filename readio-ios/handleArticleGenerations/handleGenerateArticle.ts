
import { addArticleToAmazon, addArticleToDB, createArticleCategory, bas64_It, createArticleIllustration_Pexals, createArticleTitle_D_I_Y, createArticleWithAi, createPexalsQuery, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, handleGenerateArticleProps, updateArticleToDb } from './generationUtilities';


// This is my second test of adding replicate models into lotus.

export const handleGenerateArticleReplicate = async ({
  form, user,
}: handleGenerateArticleProps) => {

  const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
  
  const title = getTheTitle?.title as string;

  const getTheCategory = await createArticleCategory(title);

  const category = getTheCategory?.category as string;
  
  const getTheArticle = await createArticleWithAi(form?.query, title);
  
  const article = getTheArticle?.articleText as string;
  
  const getThePexalQuery = await createPexalsQuery(title, article);
  
  const pexalQuery = getThePexalQuery?.pexalQuery as string;
  
  const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);
  
  const illustration = getTheIllustration?.illustration as string;

  const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(article, form?.id);
  const path = getThePathToAudio?.path;
  const audioBuffer = await bas64_It(path);

  const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus")
  const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);

  const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

  return {
    success: true,
  }


  // const input = {
  //   text: form.query,
  //   voice: form.value,
  // };

  // try {

  //   const response = await replicate.run(
  //     kokoroString, { input }
  //   );

  //   if (response && typeof response === 'object') {
  //     // Get the URL from the response object
  //     const audioUrl = response.toString();
  //     console.log("Audio URL:", audioUrl);

  //     if (!audioUrl) {
  //       throw new Error('No audio URL in response');
  //     }     

  //     return {
  //       success: true,
  //       audioUrl: audioUrl
  //     }

  //   } else if (typeof response === 'string') {
  //     console.log("Direct audio URL:", response);

  //     return {
  //       success: true,
  //       audioUrl: response
  //     }

  //   } else {
  //     throw new Error('Invalid response format');
  //   }


  // } catch (error) {
  //   console.error('Error in handleGenerateArticlePaidTier:', error);
  //   return null;
  // }

};


export const handleGenerateArticleElevenLabs = async ({
  form,
  user,
}: handleGenerateArticleProps) => {

  const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
  
  const title = getTheTitle?.title as string;

  const getTheCategory = await createArticleCategory(title);

  const category = getTheCategory?.category as string;
  
  const getTheArticle = await createArticleWithAi(form?.query, title);
  
  const article = getTheArticle?.articleText as string;
  
  const getThePexalQuery = await createPexalsQuery(title, article);
  
  const pexalQuery = getThePexalQuery?.pexalQuery as string;
  
  const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);
  
  const illustration = getTheIllustration?.illustration as string;

  const path = await fetchAudioFromElevenLabsAndReturnFilePath(article, "bc2697930732a0ba97be1d90cf641035", "ri3Bh626mOazCBOSTIae");
  const audioBuffer = await bas64_It(path);

  const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus")
  const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);

  const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

  return {
    success: true,
  }

  // try {

  //   // NOTE generate a title with ai ------------------------------------------------
  //   const readioTitles = await sql`
  //   SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
  // `;

  //   // Using a variable instead of useState for title
  //   let title = "";
  //   console.log("Starting Gemini...title");
  //   const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${form.query}. Also, here are the titles of the articles I already have. ${readioTitles}. Please give me something new and not in this list.`;
  //   const resultTItle = await geminiTitle.generateContent(promptTitle);
  //   const geminiTitleResponse = await resultTItle.response;
  //   const textTitle = geminiTitleResponse.text();
  //   title = textTitle;
  //   console.log("set title response: ", title);

  //   let category = "";
  //   const promptCategory = `Please give me a category for this title: ${title}.`;
  //   const resultCategory = await geminiCategory.generateContent(promptCategory);
  //   const geminiCategoryResponse = await resultCategory.response;
  //   const textCategory = geminiCategoryResponse.text();
  //   category = textCategory.replace(/\s+/g, '');
  //   console.log("set category response: ", category);

  //   // Using a variable instead of useState for readioText
  //   let readioText = "";
  //   const promptReadio = `Can you make me a readio about ${form.query}. The title is: ${title}.`;

  //   // const completion = await chatgpt.chat.completions.create({
  //   //   model: "gpt-4o",
  //   //   messages: [
  //   //     { role: "developer", content: systemPromptReadio },
  //   //     { role: "user", content: promptReadio },
  //   //   ],
  //   // });

  //   // console.log(completion.choices[0].message);
  //   // readioText = completion.choices[0].message.content as string;
  //   // console.log("set readio response: ", readioText);

  //   // Using a variable instead of useState for pexalQuery
  //   let pexalQuery = "";
  //   const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and the query that was asked in the first prompt was: ${form.query}.`;
  //   const resultPexals = await geminiPexals.generateContent(promptPexals);
  //   const geminiPexalsResponse = await resultPexals.response;
  //   const textPexals = geminiPexalsResponse.text();
  //   pexalQuery = textPexals;
  //   console.log("set pexal response: ", pexalQuery);

  //   // NOTE Pexals ----------------------------------------------------------
  //   console.log("Starting Pexals....");
  //   const searchQuery = `${pexalQuery}`;
  //   let illustration = "";
  //   await pexelsClient.photos
  //     .search({
  //       query: `${searchQuery}`,
  //       per_page: 1,
  //     })
  //     .then((response) => {
  //       if (response && "photos" in response && response.photos?.length > 0) {
  //         illustration = response.photos[0].src.landscape;
  //         console.log("Found a cool image for you...");
  //       } else {
  //         console.log("Couldn't find a cool image for you...");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching from Pexals:", error);
  //       console.log("Couldn't find a cool image for you...");
  //     });

  //   // NOTE database --------------------------------------------------------
  //   console.log("Starting Supabase....");

  //   // default
  //   const addReadioToDB: any = await sql`
  //   INSERT INTO readios (
  //     image,
  //     text, 
  //     topic,
  //     title,
  //     clerk_id,
  //     username,
  //     artist,
  //     tag,
  //     upvotes
  //   )
  //   VALUES (
  //     ${illustration},
  //     ${readioText},
  //     ${category as string}, 
  //     ${title},
  //     ${user?.clerk_id},
  //     ${user?.fullName},
  //     'Lotus',
  //     'default',
  //     0
  //   )
  //   RETURNING id, image, text, topic, title, clerk_id, username, artist;
  // `;

  //   console.log("addReadioToDB: ", addReadioToDB);
  //   console.log("Ending Supabase....");

  //   // NOTE elevenlabs --------------------------------------------------------
  //   console.log("Starting ElevenLabs....");

  //   async function fetchAudioFromElevenLabsAndReturnFilePath(
  //     text: string,
  //     apiKey: string,
  //     voiceId: string,
  //   ): Promise<string> {
  //     const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'xi-api-key': apiKey,
  //     };

  //     const requestBody = {
  //       text,
  //       voice_settings: { similarity_boost: 0.5, stability: 0.5 },
  //       model_id: "eleven_flash_v2",
  //     };

  //     const response = await ReactNativeBlobUtil.config({
  //       fileCache: true,
  //       appendExt: 'mp3',
  //     }).fetch(
  //       'POST',
  //       `${baseUrl}/${voiceId}`,
  //       headers,
  //       JSON.stringify(requestBody),
  //     );
  //     const { status } = response.respInfo;

  //     if (status !== 200) {
  //       throw new Error(`HTTP error! status: ${status}`);
  //     }

  //     return response.path();
  //   }

  //   const path = await fetchAudioFromElevenLabsAndReturnFilePath(
  //     readioText,
  //     // a_____________________k___e___e
  //     'bc2697930732a0ba97be1d90cf641035',
  //     // voice id
  //     "ri3Bh626mOazCBOSTIae",
  //   );
  //   console.log("path: ", path);

  //   console.log("Ending ElevenLabs....");
  //   const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
  //   const audioBuffer = Buffer.from(base64Audio, 'base64');
  //   console.log("audioBuffer: ", audioBuffer.length);

  //   console.log("Almost done...");

  //   // Upload the audio file to S3
  //   const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;
  //   console.log("s3Key line done");

  //   try {
  //     // Using the newer AWS SDK v3 approach without .promise()
  //     await s3.send(new PutObjectCommand({
  //       Bucket: "readio-audio-files",
  //       Key: s3Key,
  //       Body: audioBuffer,
  //       ContentEncoding: 'base64',
  //       ContentType: 'audio/mpeg',
  //     }));
  //     console.log("s3Key uploaded successfully");
  //   } catch (error) {
  //     console.error("Failed to upload audio to S3:", error);
  //     console.log("There was an error, please try again. ");
  //     return;
  //   }

  //   const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
  //   console.log("S3 URL: ", s3Url);

  //   // NOTE database -------------------------------------------------------- 
  //   const response = await sql`
  //   UPDATE readios
  //   SET url = ${s3Url}
  //   WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
  //   RETURNING *;
  // `;

  //   console.log("Audio successfully uploaded to S3 and path saved to the database.");

  //   return {
  //     success: true
  //   };

  // } catch (error) {
  //   console.error('Error in handleGenerateReadioCompletelyFree:', error);
  //   return {
  //     success: false
  //   };

  // }
};

