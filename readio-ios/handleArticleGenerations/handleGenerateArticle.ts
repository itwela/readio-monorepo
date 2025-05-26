import { systemPromptReplicateImageQuery } from '@/constants/tokens';
import { addArticleToAmazon, addArticleToDB, createArticleCategory, bas64_It, createArticleTitle, createArticleWithAi, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, handleGenerateArticleProps, updateArticleToDb, createArticleIllustration_Replicate, createReplicateQuery, checkForNSFWContent } from './generationUtilities';
import { EL_SticVoiceId } from './generationUtilities';


// This is my second test of adding replicate models into lotus.

export const handleGenerateArticleReplicate = async ({
  form, 
  user,
  clients,
  apiKey,
}: handleGenerateArticleProps) => {


  try {

    const getTheTitle = await createArticleTitle(form?.query, user, clients);
    console.log('✅ Title generated:', getTheTitle?.title);
    
    const title = getTheTitle?.title as string;
  
    const getTheCategory = await createArticleCategory(title, clients);
    console.log('✅ Category generated:', getTheCategory?.category);
    
    const category = getTheCategory?.category as string;

    // NOTE - NSFW Check
    const checkForNSFW = await checkForNSFWContent(title, clients);
    console.log('✅ NSFW check completed:', checkForNSFW?.nsfw);
    const nsfw = checkForNSFW?.nsfw as string;
    const articleIsNSFW = nsfw === "NSFW" ? true : false;
    
    const getTheArticle = await createArticleWithAi(form?.query, title, clients);
    console.log('✅ Article generated');
    
    const article = getTheArticle?.articleText as string;
    
    // const getThePexalQuery = await createPexalsQuery(title, article);
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery); 
    
    const getImagePrompt = await createReplicateQuery(title, clients, article);
    console.log('✅ Image prompt generated');
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery, clients); 
    console.log('✅ Illustration generated:', getTheIllustration_Replicate?.illustration);
    const illustration = getTheIllustration_Replicate?.illustration as string;
  
    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(article, form?.id, clients);
    console.log('✅ Audio path generated:', getThePathToAudio?.path);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
    console.log('✅ Audio buffer created');
  
    const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus", undefined, articleIsNSFW)
    console.log('✅ Article added to DB');
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer, clients);
    console.log('✅ Article added to Amazon');
  
    const finalStep = await updateArticleToDb(amazon_Article_Url?.s3AudioUrl, amazon_Article_Url?.s3ImageUrl, temp_Article_From_DB, user);
    console.log('✅ Article updated in DB');

    return {
      success: true,
      theArticle: finalStep,
    }

  
  } catch (error) {
    console.error('❌ Error in handleGenerateArticleReplicate:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }

};


export const handleGenerateArticleElevenLabs = async ({
  form,
  user,
  clients,
  apiKey,
}: handleGenerateArticleProps) => {

  // IF THE USER IS ON A PAID PLAN THEY WILL GET IMAGES FROM REPLICATE:
  try {

    const getTheTitle = await createArticleTitle(form?.query, user, clients);
    
    const title = getTheTitle?.title as string;
  
    const getTheCategory = await createArticleCategory(title, clients);
  
    const category = getTheCategory?.category as string;
    
    // NOTE - NSFW Check
    const checkForNSFW = await checkForNSFWContent(title, clients);
    const nsfw = checkForNSFW?.nsfw as string;
    const articleIsNSFW = nsfw === "NSFW" ? true : false;

    const getTheArticle = await createArticleWithAi(form?.query, title, clients);
    
    const article = getTheArticle?.articleText as string;
  
    // const getThePexalQuery = await createPexalsQuery(title, article);
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration_Free = await createArticleIllustration_Pexals(pexalQuery);
    
    const getImagePrompt = await createReplicateQuery(title, clients, article);
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery, clients); 
    const illustration = getTheIllustration_Replicate?.illustration as string;
  
    const path = await fetchAudioFromElevenLabsAndReturnFilePath(article, EL_SticVoiceId, apiKey);
    const audioBuffer = await bas64_It(path?.path);
    const audioDuration = path?.duration;
  
    const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus", audioDuration, articleIsNSFW)
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer, clients);
  
    const finalStep = await updateArticleToDb(amazon_Article_Url?.s3AudioUrl, amazon_Article_Url?.s3ImageUrl, temp_Article_From_DB, user);

    return {
      success: true,
      theArticle: finalStep,
    }  

  } catch {
    return {
      success: false,
    }  
  }  

};

