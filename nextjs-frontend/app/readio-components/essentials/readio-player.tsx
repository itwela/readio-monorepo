import ReadioCard from "./readio-card";
import ReadioTalkBadge from "./readio-talk-badge";
import ReactAudioPlayer from 'react-audio-player';
import ReadioAudioController from "./readio-audio-controller";
import { HTMLAttributes } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { MdStar, MdStarOutline } from "react-icons/md";

interface ReadioPlayerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
  textcontent?: string;
  audioSrc?: any;
}

const ReadioPlayer = (props: ReadioPlayerProps) => {
  return (
    <>
            <div className="fixed z-10 flex gap-4 place-items-center place-content-center justify-around px-10 w-screen h-max rounded-t-xl text-black bottom-0  p-2 backdrop-blur-md "  >
                
                {/* <Drawer>
                  
                  <DrawerTrigger >
                      <span className="text-gray-300">Readio Player</span>
                  </DrawerTrigger>

                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle className="text-gray-300">Readio Title</DrawerTitle>
                      <DrawerDescription>Readio Subtitle</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className="flex flex-col gap-2">
                        {props.textcontent}
                        <ReadioAudioController audioSrc=""/>
                      <DrawerClose>
                        <Button variant="outline" className="w-full">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>

                </Drawer> */}

                <div className="w-full max-w-3xl p-4 rounded-xl gap-4 flex flex-col">
                  <div className="rounded-xl px-8 py-4">
                  <ReadioAudioController audioSrc=""/>
                  </div>
                  <div className="w-full flex place-items-center justify-evenly">
                
                      {/* <div className="w-max p-8 rounded-full bg-gray-300"></div> */}
                      {/* <div className="w-max p-8 rounded-full bg-gray-300"></div> */}
                      <button>
                      <MdStarOutline className="w-8 h-8 text-red-500 rounded-full"/>
                      </button>

                      <div className="w-max gap-2 place-items-center place-content-center flex">
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                        <div className="w-max h-max bg-gray-300 p-6"></div>
                      </div>

                      <ReadioTalkBadge/>
                  
                  </div>
                </div>


            </div>


    </>
  ) 
};

export default ReadioPlayer;

