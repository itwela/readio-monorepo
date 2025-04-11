import {handleGenerateArticleProps, bas64_It, addArticleToAmazon, addArticleToDB, createArticleIllustration_Pexals, createArticleTitle_D_I_Y, createPexalsQuery, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, updateArticleToDb} from './generationUtilities'
import { EL_SticVoiceId } from './generationUtilities';

export async function handleGenerateArticleReplicate_Custom ({
  form,
  user,
}: handleGenerateArticleProps) {

  // This is my first test of adding replicate models into lotus.

  try {

    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(form?.query, form?.id);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
    
    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
    
    const title = getTheTitle?.title as string;
    
    const getThePexalQuery = await createPexalsQuery(title, form?.query);
    
    const pexalQuery = getThePexalQuery?.pexalQuery as string;
    
    const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);

    const illustration = getTheIllustration?.illustration as string;

    const temp_Article_From_DB = await addArticleToDB(illustration, form?.query, 'D.I.Y', user, title, user?.name)
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

    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      form?.query,
      // voiceid
      EL_SticVoiceId
    );
    const audioBuffer = await bas64_It(path);
    
    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);

    const title = getTheTitle?.title as string;

    const getThePexalQuery = await createPexalsQuery(title, form?.query);
    
    const pexalQuery = getThePexalQuery?.pexalQuery as string;
    
    const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);

    const illustration = getTheIllustration?.illustration as string;

    const temp_Article_From_DB = await addArticleToDB(illustration, form?.query, 'D.I.Y', user, title, user?.name)
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
    
    const finalStep = await updateArticleToDb(amazon_Article_Url, temp_Article_From_DB, user);

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
