import { ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/tokens';
import { readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { KeyboardAvoidingView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { geminiAdmin, geminiCategory, geminiPexals, geminiReadio, geminiTitle, genAI } from '@/helpers/geminiClient';
import { useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from '@clerk/clerk-expo';
import sql from '@/helpers/neonClient';
import { createClient } from "pexels";
import ReactNativeBlobUtil from 'react-native-blob-util'
import { accessKeyId, s3, secretAccessKey } from '@/helpers/s3Client';
import { set } from 'ts-pattern/dist/patterns';
import { Buffer } from 'buffer';
import { chatgptLotusArticles } from '@/helpers/openAiClient';
import { Keyboard } from 'react-native';


export default function AdminChatScreen() {
  const [form, setForm] = useState({ query: '' });
  const [hasConversationStarted, setHasConversationStarted] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const { user } = useUser();


  // Initialize Gemini Chat
  const [aiChat, setAiChat] = useState<any>(null);
  const [modalMessage, setModalMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [didFail, setDidFail] = useState(false);
  const [wantsToAddToDB, setWantsToAddToDB] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [loadingMessages, setLoadingMessages] = useState("Create smart article");

  async function chat() {
    try {
        setHasConversationStarted(true);
        setConversation([
            { role: "assistant", text: "Chat with AI and explore new ideas. Enter a message and click the orange button below to start a conversation. At any point if you like a smart article I give you, you can add it to the database directly from here." },
            { role: "assistant", text: "To add a smart article to the database, press the orange and white plus button next to one of my messages." },
            { role: "assistant", text: "Use the top right corner to check progess of smart article generation." },
            // { role: "user", text: "Hi." },
        ]);
    console.log("Chat started successfully.");
    } catch (error) {
    console.error("Error starting chat:", error);
    }
  }
  
//   const sendMessage = async () => {

//     if (form.query.trim() === '') return; // Prevent sending empty messages
//     const userMessage = { role: "user", text: form.query };
  
//     try {
//       // Append the user's message to the conversation
//       setConversation((prev) => [...prev, userMessage]);
  
//       const result = await aiChat.sendMessage(form.query);
//       const aiMessage = { role: "model", text: result.response.text() };
  
//       // Append the AI's response to the conversation
//       setConversation((prev) => [...prev, aiMessage]);
//       setForm({ query: '' }); // Clear the input field
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setConversation((prev) => [
//         ...prev,
//         { role: "model", text: "Sorry, something went wrong. Please try again." },
//       ]);
//     }
//   };

  // Function to send a message to OpenAI
  const sendMessage = async () => {
    if (form.query.trim() === "") return;

    // Dismiss the keyboard
    Keyboard.dismiss();

    const userMessage = { role: "user", text: form.query };
    setConversation((prev) => [...prev, userMessage]); // Append user's message

    try {
        setIsLoading(true);

        // Format messages for OpenAI API
        const formattedMessages = [
            ...conversation.map((msg) => ({ role: msg.role, content: msg.text })),
            { role: "user", content: form.query },
        ];

        // Get AI response
        const aiResponse = await chatgptLotusArticles(formattedMessages);

        setConversation((prev) => [...prev, { role: "assistant", text: aiResponse }]);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error during chat:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
        setConversation((prev) => [
            ...prev,
            { role: "assistant", text: "Sorry, something went wrong. Please try again." },
        ]);
    } finally {
        setIsLoading(false);
        setForm({ query: "" });
    }
  };

  const handleAddToDb = async (messageText: string, index: number) => {
    setShowConfirmationModal(!showConfirmationModal);
    setSelectedMessageIndex(index);
    if (loadingMessages === "Successfully added to database") {
      setLoadingMessages("Create smart article");
    }
    // setWantsToAddToDB(true);
    // await addToDb(messageText);
    // setWantsToAddToDB(false);
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    setSelectedMessageIndex(null);
    setLoadingMessages("Create smart article");    
  };

  const addToDb = async (messageText: string) => {

    setLoadingMessages("Starting to add to database");
    console.log("Adding to database")
    console.log("Message text:", messageText.substring(0, 100)); // Log only the first 20 characters of the text of the bubble next to the plus button

    setIsLoading(true);

    setLoadingMessages("Fetching readio titles");
    const readioTitles = await sql`
    SELECT title FROM readios WHERE clerk_id = ${user?.id}
    `;

    // Using a variable instead of useState for title
    let title = "";
    setLoadingMessages("Generating title");
    console.log("Starting Gemini...title");
    const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${messageText.substring(0, 100)}. Also, here are the titles of the readios I already have. ${readioTitles}. Please give me something new and not in this list.`;
    const resultTItle = await geminiTitle.generateContent(promptTitle);
    const geminiTitleResponse = await resultTItle.response;
    const textTitle = geminiTitleResponse.text();
    title = textTitle; // Assigning the response to the variable title
    console.log("set title response: ", title);

    let category = "";
    const promptCategory = `Please give me a category for this title: ${title}.`;
    const resultCategory = await geminiCategory.generateContent(promptCategory);
    const geminiCategoryResponse = await resultCategory.response;
    const textCategory = geminiCategoryResponse.text();
    category = textCategory; // Assigning the response to the variable category
    console.log("set category response: ", category);
    
    // Using a variable instead of useState for pexalQuery
    let pexalQuery = "";
    setLoadingMessages("Generating Pexals query");
    const promptPexals =  `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and heres a preview ot the article ${messageText.substring(0, 100)}.`;
    const resultPexals = await geminiPexals.generateContent(promptPexals);
    const geminiPexalsResponse = await resultPexals.response;
    const textPexals = geminiPexalsResponse.text();    
    pexalQuery = textPexals;
    console.log("set pexal response: ", pexalQuery);
    
    setLoadingMessages("Searching for Pexals");
    console.log("Starting Pexals....");
    const searchQuery = `${pexalQuery}`;
    const client = createClient(
        "WkMKeQt9mF8ce10jgThz4odFhWoR4LVdiXQSY8VVpekzd7hPNn4dpb5g"
    );
    let illustration = "";
    try {
        const pexalsResponse = await client.photos.search({
            query: `${searchQuery}`,
            per_page: 1,
        });
        if ("photos" in pexalsResponse && pexalsResponse.photos.length > 0) {
            illustration = pexalsResponse.photos[0].src.landscape;
        }
    } catch (error) {
        console.error("Error fetching Pexals:", error);
    }

    // NOTE database --------------------------------------------------------
    setLoadingMessages("Adding to Supabase");
    console.log("Starting Supabase....");
    
    // public
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
          ${messageText},
          'Lotus', 
          ${title},
          ${user?.id},
          ${user?.fullName},
          'Lotus',
          'public',
          0
          )
          RETURNING id, image, text, topic, title, clerk_id, username, artist;
    `;
    
    console.log("addReadioToDB: ", addReadioToDB);
    
    console.log("Ending Supabase....");   
    
    setLoadingMessages("Starting ElevenLabs");
    console.log("Starting ElevenLabs....");

    async function fetchAudioFromElevenLabsAndReturnFilePath(
      text: string,
      apiKey: string,
      voiceId: string,
    ): Promise<string> {
      const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech'
      const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      }
    
      const requestBody = {
        text,
        voice_settings: { similarity_boost: 0.5, stability: 0.5 },
      }
    
      const response = await ReactNativeBlobUtil.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
        appendExt: 'mp3',
      }).fetch(
        'POST',
        `${baseUrl}/${voiceId}`,
        headers,
        JSON.stringify(requestBody),
      )
      const { status } = response.respInfo
    
      if (status !== 200) {
        throw new Error(`HTTP error! status: ${status}`)
      }
    
      return response.path()
    }

    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      messageText,
      'bc2697930732a0ba97be1d90cf641035',
      "ri3Bh626mOazCBOSTIae",
    )
    console.log("path: ", path);
  
    setLoadingMessages("Ending ElevenLabs");
    console.log("Ending ElevenLabs....");


    try {

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    console.log("base64Audio:");
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    console.log("audioBuffer: ", audioBuffer.length);
  
    // Upload the audio file to S3
    const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;  // Define the file path within the S3 bucket
    console.log("s3Key line done");

    const aki = accessKeyId
    const ski = secretAccessKey

    console.log("aki: ", aki);
    console.log("ski: ", ski);
    
    await s3.upload({
        Bucket: "readio-audio-files",  // Your S3 bucket name
        Key: s3Key,
        Body: audioBuffer, // Read file as Base64
        ContentEncoding: 'base64', // Specify base64 encoding
        ContentType: 'audio/mpeg', // Specify content type
    }).promise();
    
    console.log("s3Key uploaded: ");

    const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    console.log("S3 URL: ", s3Url);
  
    // NOTE database -------------------------------------------------------- 
    const response = await sql`
    UPDATE readios
    SET url = ${s3Url}
    WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.id}
    RETURNING *;
    `;  

    setLoadingMessages("Successfully created article!");
    setTimeout(() => {      
    }, 2000);
    console.log("Audio successfully uploaded to S3 and path saved to the database.");
        
    } catch (error) {
    console.error("Failed to upload audio to S3:", error);  

      setLoadingMessages("Failed to upload audio to S3");
      setIsLoading(false);
      setDidFail(true);
      setTimeout(() => {
        
      }, 2000);
      setIsLoading(false);
      setWantsToAddToDB(false);
    } finally {

      setIsLoading(false);

    } 



  }

  useEffect(() => {
    chat();
  }, [user?.id]);

  useEffect(() => {
    if (didFail) {
      setTimeout(() => {
        setDidFail(false);
      }, 2000); // Reset didFail after 2 seconds
    }
  }, [didFail]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.readioBrown, paddingBottom: 60 }]}>
      <View style={styles.header}>
        <View style={{display: 'flex', flexDirection: 'column'}}>
            <Text style={styles.title}>Add</Text>
            <Text style={{color: colors.readioWhite, width: 300, fontSize: 18}}>Chat with AI & add articles to our database.</Text>
        </View>
        {isDone === true && (
            <>
            <View style={{backgroundColor: "green", width: 40, height: 40, borderRadius: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <FontAwesome name="check" size={24} color={colors.readioWhite} />            
            </View>
            </>
        )}

        {isLoading === true && (
            <>
            <View style={{backgroundColor: colors.readioOrange, width: 40, height: 40, borderRadius: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="small" color={colors.readioWhite} />
            </View>
            </>
        )}

        {isLoading === false && (
            <>
            <FontAwesome name="gear" size={24} color={colors.readioWhite} />
            </>
        )}

        {didFail === true && (
            <>
            <View style={{backgroundColor: "red", width: 40, height: 40, borderRadius: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <FontAwesome name="close" size={24} color={colors.readioWhite} />            
            </View>
            </>
        )}
      </View>

      {hasConversationStarted === true && (
        <>

        <FlatList
          data={conversation}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.messageContainer]}>
              <View style={{alignSelf: item.role === "user" ? "flex-end" : "flex-start", display: "flex", flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10}}>
                {item.role === "user" && (  
                    <TouchableOpacity onPress={() => handleAddToDb(item.text, index)} activeOpacity={0.9} style={{borderRadius: 10, marginRight: 10, padding: 5, opacity: 0.5, marginVertical: 10, backgroundColor: colors.readioOrange}}>
                        <FontAwesome name="plus" size={10} color={colors.readioWhite} />
                    </TouchableOpacity>
                )}
                <Text style={[styles.message, item.role === "user" ? styles.userMessage : styles.modelMessage]}>
                    {item.text}
                </Text>
                {item.role === "assistant" && (
                    
                    <TouchableOpacity onPress={() => handleAddToDb(item.text, index)} activeOpacity={0.9} style={{borderRadius: 10, opacity: 0.5, padding: 5, marginVertical: 10, backgroundColor: colors.readioOrange}}>
                        <FontAwesome name="plus" size={10} color={colors.readioWhite} />
                    </TouchableOpacity>
                )}
              </View>
              {showConfirmationModal && index === selectedMessageIndex && (
                  <>
                    <View style={{display: 'flex', width: "80%", flexDirection: 'column', gap: 5, padding: 5}}>
                        {loadingMessages != "Successfully created article!" && (
                        <TouchableOpacity onPress={() => addToDb(item.text)} activeOpacity={0.9} style={{borderRadius: 10, padding: 5, backgroundColor: colors.readioOrange}}>  
                            <Text style={{color: colors.readioWhite, fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>{loadingMessages}</Text>
                        </TouchableOpacity>
                        )}

                        {loadingMessages == "Successfully created article!" && (
                        <TouchableOpacity activeOpacity={0.9} style={{borderRadius: 10, padding: 5, backgroundColor: "green"}}>  
                            <Text style={{color: colors.readioWhite, fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>{loadingMessages}</Text>
                        </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.9} style={{borderRadius: 10, padding: 5, backgroundColor: colors.readioBlack}}>
                            <Text style={{color: colors.readioWhite, fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                  </>
              )}
            </View>
          )}
          style={styles.chatContainer}
        />


        </>
      )}
      
      {/* {hasConversationStarted === false && (
        <View style={styles.startChatContainer}>
          <Text style={styles.text}>Welcome to the Admin Chat</Text>
          <Text style={styles.description}>
            Chat with AI and explore new ideas. Click the button below to start a conversation.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={chat}>
            <Text style={styles.startButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      )} */}

      <KeyboardAvoidingView behavior="padding" style={styles.inputContainer} keyboardVerticalOffset={10}>
        <TextInput
          style={styles.input}
          value={form.query}
          onChangeText={(text) => setForm({ ...form, query: text })}
          placeholder="Enter your message..."
          placeholderTextColor={colors.readioWhite}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <FontAwesome name="send" size={20} color={colors.readioWhite} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.readioBrown,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    color: colors.readioWhite,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
    flexDirection: 'column',
  },
  messageContainer: {
    marginVertical: 5,
    width: 'auto', // Adjusted to allow dynamic width based on message content

  },
  message: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%', // Adjusted to allow dynamic width based on message content
  },
  userMessage: {
    backgroundColor: colors.readioOrange,
    color: colors.readioWhite,
    overflow: 'hidden', // Added to ensure corners are visible
    fontSize: 18,
  },
  modelMessage: {
    color: colors.readioWhite,
    backgroundColor: colors.readioBlack,
    overflow: 'hidden', // Added to ensure corners are visible
    fontSize: 18,
  },
  startChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.readioWhite,
  },
  description: {
    textAlign: 'center',
    color: colors.readioWhite,
    marginBottom: 20,
    width: "70%",
  },
  startButton: {
    backgroundColor: colors.readioOrange,
    padding: 10,
    borderRadius: 5,
  },
  startButtonText: {
    color: colors.readioWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    color: colors.readioWhite,
    padding: 10,
    borderColor: colors.readioWhite,
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: colors.readioOrange,
    padding: 10,
    borderRadius: 50,
  },
});