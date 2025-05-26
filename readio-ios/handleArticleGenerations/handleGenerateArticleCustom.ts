import {handleGenerateArticleProps, bas64_It, addArticleToAmazon, addArticleToDB, createArticleTitle, fetchAudioFromElevenLabsAndReturnFilePath, fetchAudioFromReplicateAndReturnFilePath, updateArticleToDb, createReplicateQuery, createArticleIllustration_Replicate, checkForNSFWContent} from './generationUtilities'
import { EL_SticVoiceId } from './generationUtilities';
import sql from '@/helpers/neonClient';

export async function handleGenerateArticleReplicate_Custom ({
  form,
  user,
  clients,
  apiKey,
}: handleGenerateArticleProps) {

  try {
    const getTheTitle = await createArticleTitle(form?.query, user, clients);
    console.log('✅ Title generated:', getTheTitle?.title);
    const title = getTheTitle?.title as string;

    // NOTE - NSFW Check
    const checkForNSFW = await checkForNSFWContent(title, clients);
    console.log('✅ NSFW check completed:', checkForNSFW?.nsfw);
    const nsfw = checkForNSFW?.nsfw as string;
    const articleIsNSFW = nsfw === "NSFW" ? true : false;
    
    const getThePathToAudio = await fetchAudioFromReplicateAndReturnFilePath(form?.query, form?.id, clients);
    console.log('✅ Audio path generated:', getThePathToAudio?.path);
    const path = getThePathToAudio?.path;
    const audioBuffer = await bas64_It(path);
    console.log('✅ Audio buffer created');
    
    const getImagePrompt = await createReplicateQuery(title, clients, form?.query);
    console.log('✅ Image prompt generated');
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery, clients); 
    console.log('✅ Illustration generated:', getTheIllustration_Replicate?.illustration);
    const illustration = getTheIllustration_Replicate?.illustration as string;

    const temp_Article_From_DB = await addArticleToDB(illustration, form?.query, 'D.I.Y', user, title, user?.name, undefined, articleIsNSFW)
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
    console.error('❌ Error in handleGenerateArticleReplicate_Custom:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export async function handleGenerateArticleElevenLabs_Custom ({
  form,
  user,
  clients,
  apiKey
}: handleGenerateArticleProps)  {
 
  try {
    const getTheTitle = await createArticleTitle(form?.query, user, clients);
    console.log('✅ Title generated:', getTheTitle?.title);
    const title = getTheTitle?.title as string;

    // NOTE - NSFW Check
    const checkForNSFW = await checkForNSFWContent(title, clients);
    console.log('✅ NSFW check completed:', checkForNSFW?.nsfw);
    const nsfw = checkForNSFW?.nsfw as string;
    const articleIsNSFW = nsfw === "NSFW" ? true : false;

    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      form?.query,
      EL_SticVoiceId,
      apiKey,
      user?.user_role
    );
    console.log('✅ Audio path generated');
    const audioBuffer = await bas64_It(path?.path);
    console.log('✅ Audio buffer created');
    const audioDuration = path?.duration;

    // NOTE - Update user's stic voice usage
    try {
      await sql`
        UPDATE users 
        SET stic_voice_usage_seconds = stic_voice_usage_seconds + ${audioDuration}
        WHERE user_db_id = ${user?.user_db_id}
      `;
      console.log('✅ Updated user stic voice usage');
    } catch (error) {
      console.error('❌ Error updating stic voice usage:', error);
      throw error;
    }

    const getImagePrompt = await createReplicateQuery(title, clients, form?.query);
    console.log('✅ Image prompt generated');
    const replicateQuery = getImagePrompt?.replicateQuery as string;
    const getTheIllustration_Replicate = await createArticleIllustration_Replicate(replicateQuery, clients); 
    console.log('✅ Illustration generated:', getTheIllustration_Replicate?.illustration);
    const illustration = getTheIllustration_Replicate?.illustration as string;

    // NOTE - Add article to DB without stic_voice_usage_seconds
    const temp_Article_From_DB = await addArticleToDB(
      illustration, 
      form?.query, 
      'D.I.Y', 
      user, 
      title, 
      user?.name, 
      undefined, // Don't pass duration here
      articleIsNSFW
    );
    console.log('✅ Article added to DB');
    
    const amazon_Article_Url = await addArticleToAmazon(temp_Article_From_DB, audioBuffer, clients);
    console.log('✅ Article added to Amazon');
    
    const finalStep = await updateArticleToDb(amazon_Article_Url?.s3AudioUrl, amazon_Article_Url?.s3ImageUrl, temp_Article_From_DB, user);
    console.log('✅ Article updated in DB');

    return {
      success: true,
      theArticle: finalStep,
    };

  } catch (error) {
    console.error('❌ Error in handleGenerateArticleElevenLabs_Custom:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
