'use client'

import { ElevenLabsClient, play } from "elevenlabs";
import React, { useState } from 'react';
import { MdPlayCircle, MdPauseCircle } from "react-icons/md";
import { toast } from "sonner";
import { HTMLAttributes } from "react";
import { useRef } from "react";
import { useReadioMain } from "@/app/hooks/playingContextProvider";


interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  className?: string;
  audioSrc?: string;
  textcontent?: string;
}

const ReadioTalkBadge = (props: ButtonProps) => {
 
  const { className, children, textcontent, ...rest } = props;
  const {isPlaying, setIsPlaying} = useReadioMain();
  const audioRef = useRef<HTMLAudioElement>(null);


  const togglePlayPause = () => {
    // const audio = audioRef.current;
    // if (audio) {
    //   if (isPlaying) {
    //     audio.pause();
    //   } else {
    //     audio.play();
    //   }
      setIsPlaying(!isPlaying);
    // }
  };

  //▶️ Eleven labs functions ------- START ------- ▶️ -------------
  

  // step 1️⃣ ---------------
  // Function to make a request to the /api/elevenlabs API route (BLOB response).
  async function getElevenLabsResponse (text: any) {
    const response = await fetch("/api/elevenlabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: textcontent,
        // ANCHOR this is the voice ID of the voice you want to use
        voice: "hJ9aNCtXg5rLXeFF18zw"
      })
    });
  
    // Notify the user if the API Key is invalid.
    if (response.status === 401) {
      toast.message("Your ElevenLabs API Key is invalid. Kindly check and try again.", {
      });
    }
  
    const data = await response.blob();
    console.log(data)
    return data;
  };

  
  //  step 2️⃣ ---------------
  async function saveAudioToLocalStorage() {
    try {
      const botVoiceResponse = await getElevenLabsResponse('');
      const reader = new FileReader();
      reader.readAsDataURL(botVoiceResponse);
      await new Promise((resolve) => {
        reader.onload = () => {
          const audioDataUrl = reader.result as string;
          localStorage.setItem('audioDataUrl', audioDataUrl);
          resolve(null); // Resolve the promise when done saving
        };
      });
    } catch (error) {
      console.error('Error saving audio to local storage:', error);
    }
  }
  
  // step 3️⃣ ---------------
  async function playAudioFromLocalStorage() {
    try {
      console.log('Saving audio to local storage..');
      await saveAudioToLocalStorage(); // Wait for audio to be saved
      console.log('Getting audio from local storage..');
      const audioDataUrl = localStorage.getItem('audioDataUrl');
      if (audioDataUrl) {
        console.log('Audio found in local storage, playing..');
        const audio = new Audio();
        audio.src = audioDataUrl;
  
        audio.oncanplaythrough = () => {
          console.log('Audio loaded, playing..');
          setIsPlaying(true);
          audio.play();
        };

  
        audio.onerror = (error) => {
          console.error('Error playing audio:', error);
        };
      } else {
        console.error('No audio data found in local storage.');
      }
    } catch (error) {
      console.error('Error playing audio from local storage:', error);
    }
  }

  // 🔚  Eleven labs functions ------- END ------- 🔚

  // FUnction to download blog
  async function downloadBlob() {
    try {
      const botVoiceResponse = await getElevenLabsResponse('');
      const url = window.URL.createObjectURL(botVoiceResponse);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  }
  
  // Toast test function
  function testStuff()  {
    toast.success("Test", {
      description: "bc2697930732a0ba97be1d90cf641035",
      id: "readioTestToast",
    });
    console.log("bc2697930732a0ba97be1d90cf641035");
  };


  return (
    <>
      <div className="flex place-items-center gap-4">
        <button onClick={() => togglePlayPause()} className="flex items-center justify-center text-red-500 w-max h-1/2 rounded-full">
        {/* <button onClick={playAudioFromLocalStorage} className="flex items-center justify-center text-red-500 w-max h-1/2 rounded-full"> */}
          {isPlaying ? <MdPauseCircle className="w-10 h-10" /> : <MdPlayCircle className="w-10 h-10"/>}
        </button>
        {/* <button onClick={testStuff} className="w-max h-6 px-4 text-white bg-green-500 rounded-full">
          test
        </button> */}
      </div>
    </>
  );
};

export default ReadioTalkBadge;