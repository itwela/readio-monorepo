import { addArticleToAmazon, addArticleToDB, createArticleCategory, bas64_It, createArticleIllustration_Pexals, createArticleTitle_D_I_Y, createArticleWithAi, createPexalsQuery, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, handleGenerateArticleProps, updateArticleToDb } from './generationUtilities';
import { EL_SticVoiceId } from './generationUtilities';


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

  const path = await fetchAudioFromElevenLabsAndReturnFilePath(article, EL_SticVoiceId);
  const audioBuffer = await bas64_It(path);

  const temp_Article_From_DB = await addArticleToDB(illustration, article, category, user, title, "Lotus")
  const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);

  const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

  return {
    success: true,
  }

};

