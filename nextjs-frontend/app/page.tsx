'use client'

import Image from "next/image";
import ReadioHeading from "./readio-components/essentials/readio-heading";
import ReadioCard from "./readio-components/essentials/readio-card";
import ReadioPlayer from "./readio-components/essentials/readio-player";
import { useState } from "react";
import { Toaster } from "sonner";
import { useRef } from "react";
import { useReadioMain } from "./hooks/playingContextProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);

  // will have to get all blog content here and pass it to different components form her
  // this is just placeholder content.

  const { selectedText, setSelectedText } = useReadioMain();
  const { isPlaying, setIsPlaying } = useReadioMain();
  
  const card1text = 'Take care of your body. It’s the only place you have to live.” – Jim Rohn'
  const card2text = 'To keep the body in good health is a duty… otherwise we shall not be able to keep our mind strong and clear.” – Buddha'
  const card3text = 'You can’t enjoy wealth if you’re not in good health.” – Anonymous'
  const card4text = 'The first wealth is health.” – Ralph Waldo Emerson'
  // Function to handle card click and set the text content for the audio player
  const handleTextChange = () => {
    setSelectedText(card1text); // Update global state
  };

  return (
    <>
      <Toaster/>
      <ReadioPlayer audioSrc={audioRef} textcontent={selectedText}/>
      <main className="w-screen h-screen">
          <motion.div>
            <ReadioHeading className=""/>
          </motion.div>
        <section className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full h-full overflow-hidden flex flex-col px-5 place-items-center place-content-center">
            
              <ReadioCard textcontent={card1text}>
                <p>{card1text}</p>
                </ReadioCard>

              {/* <ReadioCard textcontent={card2text}>
                <p>{card2text}</p>
              </ReadioCard>

              <ReadioCard textcontent={card3text}>
                <p>{card3text}</p>
              </ReadioCard>

              <ReadioCard textcontent={card4text}>
                <p>{card4text}</p>
              </ReadioCard> */}
              
            </div>
        </section> 
      </main>
     <Toaster/>
    </>
  );
}
