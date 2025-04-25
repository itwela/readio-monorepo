import { systemPromptReplicateImageQuery } from '@/constants/tokens';
import { addArticleToAmazon, addArticleToDB, createArticleCategory, bas64_It, createArticleIllustration_Pexals, createArticleTitle_D_I_Y, createArticleWithAi, createPexalsQuery, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, handleGenerateArticleProps, updateArticleToDb, createArticleIllustration_Replicate, createReplicateQuery } from './generationUtilities';
import { EL_SticVoiceId } from './generationUtilities';


// This is my second test of adding replicate models into lotus.

export const handleGenerateArticleReplicate = async ({
  form, 
  user,
}: handleGenerateArticleProps) => {

  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';

  try {

    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
    
    const title = getTheTitle?.title as string;
  
    const getTheCategory = await createArticleCategory(title);
  
    const category = getTheCategory?.category as string;
    
    const getTheArticle = await createArticleWithAi(form?.query, title);
    
    const article = getTheArticle?.articleText as string;
    
    // const getThePexalQuery = await createPexalsQuery(title, article);
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery); 
    
    const getImagePrompt = await createReplicateQuery(title, article);
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery); 
    const illustration = getTheIllustration_Replicate?.illustration as string;
  
    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(article, form?.id);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
  
    const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus")
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
  
    const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

    return {
      success: true,
    }

  
  } catch {

    return {
      success: false,
    }

  }

};


export const handleGenerateArticleElevenLabs = async ({
  form,
  user,
}: handleGenerateArticleProps) => {

  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';

  // IF THE USER IS ON A PAID PLAN THEY WILL GET IMAGES FROM REPLICATE:
  try {

    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
    
    const title = getTheTitle?.title as string;
  
    const getTheCategory = await createArticleCategory(title);
  
    const category = getTheCategory?.category as string;
    
    const getTheArticle = await createArticleWithAi(form?.query, title);
    
    const article = getTheArticle?.articleText as string;
  
    // const getThePexalQuery = await createPexalsQuery(title, article);
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration_Free = await createArticleIllustration_Pexals(pexalQuery);
    
    const getImagePrompt = await createReplicateQuery(title, article);
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery); 
    const illustration = getTheIllustration_Replicate?.illustration as string;
  
    const path = await fetchAudioFromElevenLabsAndReturnFilePath(article, EL_SticVoiceId);
    const audioBuffer = await bas64_It(path);
  
    const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus")
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
  
    const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

    return {
      success: true,
    }  

  } catch {
    return {
      success: false,
    }  
  }  

};

