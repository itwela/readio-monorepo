import cn from "clsx";
import { HTMLAttributes, ReactNode } from "react";
import ReadioTalkBadge from "./readio-talk-badge";
import { useReadioMain } from "@/app/hooks/playingContextProvider";
import { motion, AnimatePresence } from "framer-motion"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  textcontent?: string;
}

const ReadioCard = (props: CardProps) => {
  // consts
  const { className, children, textcontent, ...rest } = props;
  const { isPlaying, setIsPlaying } = useReadioMain();

  // functions
  const handlePlaying = () => {
    setIsPlaying(!isPlaying);
    console.log(textcontent)
  }

  return (
    <>
    <AnimatePresence>

      {/* the small readio card */}
    {!isPlaying &&
      <motion.div 
      initial={{ 
        opacity: 0,
        x: 0
      }}
      animate={{ 
          opacity: 1,
          x: 0 
      }}
      exit={{ 
          opacity: 0,
          x: 10,
      }}
      whileHover={{ 
          scale: 1.02 
      }}
      className="w-max h-max"
      onClick={handlePlaying}
      >
        <div className={cn(`
          w-[200px] h-[80px] my-4 flex flex-col place-self-center 
          overflow-hidden backdrop-blur-md bg-gray-800/10 
          hover:bg-gray-800/20 cursor-pointer rounded-lg
          place-items-center place-content-center`, 
          className)} {...rest}>
          
          {/* <div className={cn("w-full h-max truncate p-4 flex gap-4 place-self-center rounded-t-lg", className)} {...rest}>
            {children}
          </div> */}
        
          <div className="w-max flex justify-between place-items-center p-2 h-max">
            {/* <div className={cn("w-max h-max p-[0.1rem] bg-red-500", className)} {...rest}/> */}
            <ReadioTalkBadge textcontent={textcontent} />
          </div>
        </div>
      </motion.div>
    }

    {/* showing the full width of the blog */}

    {isPlaying &&
      <motion.div 
      initial={{ 
        opacity: 0,
        x: 0
      }}
      animate={{ 
          opacity: 1,
          x: 0 
      }}
      exit={{ 
          opacity: 0,
          x: -500,
      }}
      className="w-full h-full"
      >
        <div className={cn(`
          w-full h-full my-4 flex flex-col place-self-center 
          overflow-hidden backdrop-blur-md
          cursor-pointer rounded-lg
          place-items-center place-content-center`,
           className)} {...rest}>
          
          {/* this is the text being written */}
          <div className={cn("w-max h-full justify-evenly place-items-center place-content-center p-4 flex-col  flex gap-4 place-self-center rounded-t-lg", className)} {...rest}>

          <p className="text-7xl">Motivation</p>

           <div>
              {children}
              <div className="flex place-items-center gap-4 w-full">
                  <div className={cn("w-full h-max p-[0.1rem] bg-red-500", className)} {...rest}/>
                  <p>Readio</p>
                  <div className={cn("w-full h-max p-[0.1rem] bg-red-500", className)} {...rest}/>
              </div>
           </div>
           

            <div></div>

          </div>
        
          {/* this is the red line and the button */}

        </div>
      </motion.div>
    }
    </AnimatePresence>
    </>
  );
};

export default ReadioCard