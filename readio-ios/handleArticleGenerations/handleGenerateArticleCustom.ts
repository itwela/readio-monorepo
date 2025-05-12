import {handleGenerateArticleProps, bas64_It, addArticleToAmazon, addArticleToDB, createArticleIllustration_Pexals, createArticleTitle_D_I_Y, createPexalsQuery, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, updateArticleToDb, createReplicateQuery, createArticleIllustration_Replicate} from './generationUtilities'
import { EL_SticVoiceId } from './generationUtilities';

export async function handleGenerateArticleReplicate_Custom ({
  form,
  user,
}: handleGenerateArticleProps) {

  // This is my first test of adding replicate models into lotus.
  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';

  try {

    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(form?.query, form?.id);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
    
    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);
    
    const title = getTheTitle?.title as string;
    
    // NOTE - PEXALS IMAGE IMPLEMENTATION - ARCHIVED FOR NOW
    // const getThePexalQuery = await createPexalsQuery(title, form?.query);
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);
    
    const getImagePrompt = await createReplicateQuery(title, form?.query);
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery); 
    const illustration = getTheIllustration_Replicate?.illustration as string;


    const temp_Article_From_DB = await addArticleToDB(illustration, form?.query, 'D.I.Y', user, title, user?.name)
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
    
    const finalStep = await updateArticleToDb(amazon_Article_Url?.s3AudioUrl, amazon_Article_Url?.s3ImageUrl, temp_Article_From_DB, user);

    return {
      success: true,
      theArticle: finalStep,
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
 
  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';

  try {

    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      form?.query,
      // voiceid
      EL_SticVoiceId
    );
    const audioBuffer = await bas64_It(path?.path);
    
    const getTheTitle = await createArticleTitle_D_I_Y(form?.query, user);

    const title = getTheTitle?.title as string;

    // const getThePexalQuery = await createPexalsQuery(title, form?.query); 
    // const pexalQuery = getThePexalQuery?.pexalQuery as string;
    // const getTheIllustration = await createArticleIllustration_Pexals(pexalQuery);

    const getImagePrompt = await createReplicateQuery(title, form?.query);
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery); 
    const illustration = getTheIllustration_Replicate?.illustration as string;

    const temp_Article_From_DB = await addArticleToDB(illustration, form?.query, 'D.I.Y', user, title, user?.name)
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer);
    
    const finalStep = await updateArticleToDb(amazon_Article_Url?.s3AudioUrl, amazon_Article_Url?.s3ImageUrl, temp_Article_From_DB, user);

    return {
      success: true,
      theArticle: finalStep,
    };

  } catch (error) {

    console.error('Error in handleGenerateArticleElevenLabs_Custom:', error);
    return {
      success: false
    };

  }
};
