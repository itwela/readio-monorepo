'use client'

import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { motion } from 'framer-motion';
import { Volume2, VolumeOff, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import SlotCounter from 'react-slot-counter';
import { getStepCount, joinWaitlist } from './actions';
import logo from './assets/images/cropwhitelogo.png';
import diadora from './assets/images/diadoraLogo.png';
import pgBarGif from './assets/images/pgBar.gif';
import union from './assets/images/unionLogo.png';
import { sendConfirmedEmail } from './emails/actions';


const colors = {
  primary: '#fc3c44',
  background: '#000',
  text: '#000',
  textMuted: '#9ca3af',
  icon: "#2F2B2A",
  minimumTrackTintColor: "#2F2B2A",
  maximumTrackTintColor: '#DB581A',
  readioBrown: '#272121',
  readioWhite: '#E9E0C1',
  readioBlack: '#2F2B2A',
  readioOrange: '#DB581A',
  readioDustyWhite: "#DAD2B6"
}

export default function Home() {

  // const avatars = [
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/16860528",
  //     profileUrl: "https://github.com/dillionverma",
  //   },
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/20110627",
  //     profileUrl: "https://github.com/tomonarifeehan",
  //   },
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/106103625",
  //     profileUrl: "https://github.com/BankkRoll",
  //   },
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/59228569",
  //     profileUrl: "https://github.com/safethecode",
  //   },
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/59442788",
  //     profileUrl: "https://github.com/sanjay-mali",
  //   },
  //   {
  //     imageUrl: "https://avatars.githubusercontent.com/u/89768406",
  //     profileUrl: "https://github.com/itsarghyadas",
  //   },
  // ];

  const mainHeroText = (
    <>
      100 Million Steps.<br />
      1 Movement.<br />
      Every Step Counts.
    </>
  );

  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [waitlistError, setWaitlistError] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<React.ReactNode>();
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [stepsAreLoading, setStepsAreLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Let\'s Go');
  const [progress, setProgress] = useState(0);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email validation regex
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setWaitlistEmail(email);
    setIsEmailValid(validateEmail(email));
  };

  const alreadyJoinedMessage = (
    <>
      We appreciate your interest!<br />
      However, you&apos;re already signed up to our waitlist!<br /><br />
      Check your email for confirmation.
    </>
  );
  const successMessage = (
    <>
      Success! 🎉 Thank you for joining our waitlist!<br /><br />
      Check your email for more information.
    </>
  );

  const errorMessage = (
    <>
      Error! We appreciate your interest, but we ran into an issue.<br /><br />
      Please try again.
    </>
  );

  function ConfettiSideCannons() {
    const handleClick = () => {
      const end = Date.now() + 3 * 1000; // 3 seconds
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
   
      const frame = () => {
        if (Date.now() > end) return;
   
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        });
   
        requestAnimationFrame(frame);
      };
   
      frame();
    };

    handleClick();
  }

  useEffect(() => {
    if (waitlistLoading) {
      let progress = 0;
      let animationFrame: number;

      const animate = () => {
        progress = progress + (100 - progress) * 0.1; // Lerp towards 100
        setProgress(progress);

        if (Math.abs(100 - progress) > 0.5) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setProgress(100);
          setTimeout(() => setWaitlistLoading(false), 500);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [waitlistLoading]);

  const handleJoinWaitlist = async (email: string) => {
    setWaitlistMessage('');
    setWaitlistLoading(true);
    setWaitlistSuccess(false);
    setWaitlistError(false);
    setProgress(0)


    console.log('Joining waitlist:', waitlistEmail);

    const result = await joinWaitlist(email);

    if (result.message === "Already Joined") {
      setWaitlistMessage(alreadyJoinedMessage);
      setWaitlistSuccess(true);
    }

    if (result.message === "Success") {
      setWaitlistMessage(successMessage);
      setButtonText("Joined! 🎉");
      setWaitlistSuccess(true);
      sendConfirmedEmail("noreply", 'Welcome to GIANT STEPS!', email)
    }

    if (result.message === "Error") {
      setWaitlistMessage(errorMessage);
      setWaitlistError(true);
    }

    setTimeout(() => {
      setWaitlistLoading(false);
      ConfettiSideCannons();
    }, 1618)
    return;

  };

  const [stepsString, setStepsString] = useState('0');
  const [buttonHover, setButtonHover] = useState(false);
  const [wantsToHear, setWantsToHear] = useState(false);
  useEffect(() => {

    const getSteps = async () => {
      const steps = await getStepCount();
      const unpackedSteps = steps?.[0]?.total
      setStepsString(unpackedSteps.toString().padStart(9, '0'));
      setStepsAreLoading(false);
    };

    // Call getSteps immediately
    getSteps();

    // Set an interval to call getSteps every 10 minutes
    const interval = setInterval(() => {
      getSteps();
    }, 600000); // 10 minutes in milliseconds

    // Cleanup function to clear interval on unmount
    return () => clearInterval(interval);

  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudio = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .catch((err) => console.error("Error playing audio:", err));
    } else {
      audioRef.current.pause();
    }
  };

  const handleReset = () => {
    setWaitlistEmail("")
    setWaitlistError(false)
    setWaitlistMessage('')
    setWaitlistSuccess(false)
    setWaitlistLoading(false)
    setIsEmailValid(false)
    setButtonText('Let\'s Go')
  }

  return (
    <>
      {stepsAreLoading === false && (
        <>

          <div
            className="w-screen h-screen absolute top-0 z-[-1] left-0"
            style={{ backgroundColor: colors.readioBrown, opacity: 0.80618 }}
          >
          </div>

          <video
            src='./walking.mp4'
            width="100%"
            className="h-screen absolute top-0 left-0 z-[-2]"
            height="auto"
            loop
            muted
            autoPlay
            style={{ objectFit: 'cover' }}
          />

          <div className='absolute top-5 right-5 z-[3]'
            style={{ backgroundColor: colors.readioWhite, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <audio loop ref={audioRef} src='/growthIntro.mp3' />
            <button
              onClick={() => {
                setWantsToHear(!wantsToHear);
                handleAudio();
              }}
              style={{ color: colors.readioBlack }}
            >
              {wantsToHear ? <Volume2 /> : <VolumeOff />}
            </button>
          </div>

          <div className="w-screen h-screen ">

            <div className='w-full h-full flex flex-col place-content-center md:px-8'>

              {/* SECTION MAIN */}
              <div className='lg::w-[50%] w-full h-max flex flex-col gap-5 place-items-center place-content-center md:place-items-start md:place-content-start'>

                <div className='flex flex-col gap-1 h-max place-items-center md:place-items-start w-max'>
                  <Image alt="phone" width={45} height={0} src={logo.src}></Image>
                  <p className='font-bold font-giant text-3xl my-[0.5rem] md:text-4xl md:my-[0.5rem] lg:text-5xl lg:my-[1rem]' style={{ color: colors.readioWhite }}>Giant Steps</p>
                </div>

                <div className='w-[85%] flex rounded-lg h-max font-main-bold  place-content-center md:place-content-start '>
                  <SlotCounter value={stepsString} charClassName='text-2xl rounded-t-md md:mx-1 md:text-4xl lg:text-5xl font-bold px-2 h-full outline outline-[#E9E0C1]  text-[#E9E0C1]' />
                </div>

                <div className='w-[85%] flex flex-col gap-5 lg:place-content-center '>

                  <h1
                    // 6xl at lg screen
                    className="text-3xl sm:text-4xl text-center md:text-left font-main-bold lg:text-5xl font-bold"
                    style={{ color: colors.readioWhite }}
                  >
                    {mainHeroText}
                  </h1>


                  <p
                    // md at lg screen 
                    className='text-xs text-center md:text-left font-main sm:text-md font-bold'
                    style={{ color: colors.readioWhite }}
                  >
                    Be one of the first 1,000 sign-ups for a chance to receive a free pair of Diadora sneakers!
                  </p>

                </div>

                <div className='w-[85%] my-5 flex gap-5 place-items-center place-content-center md:place-content-start '>

                  <div className='max-w-[400px] w-[61.8%] h-[40px]'>
                    <input
                      value={waitlistEmail}
                      onChange={handleEmailChange}
                      placeholder="Enter Your Email"
                      className={` font-main  w-full h-full outline-none rounded-lg text-sm md:text-md font-bold px-3 ${!isEmailValid && waitlistEmail ? 'border border-[#DB581A]' : ""}
                        }`}
                      style={{ backgroundColor: colors.readioBlack, color: colors.readioWhite }}
                    />
                    {!isEmailValid && waitlistEmail && <p className=" opacity-[61%] text-[#DB581A] text-sm mt-1">Please enter a valid email.</p>}
                  </div>

                  <button
                    onMouseEnter={() => setButtonHover(true)}
                    onMouseLeave={() => setButtonHover(false)}
                    onClick={() => { 
                      if (!waitlistLoading && isEmailValid) {handleJoinWaitlist(waitlistEmail); }
                    }}
                    className='max-w-[100px] w-[38.2%] font-main-bold h-[40px] rounded-lg text-sm sm:text-md md:text-md font-bold text-center place-items-center place-content-center flex'
                    style={{ backgroundColor: buttonHover && !waitlistLoading ? colors.readioOrange : buttonText === 'Joined! 🎉' ? colors.readioOrange : colors.readioBlack, color: colors.readioWhite }}
                  >
                    {waitlistLoading ? <Image alt="loading" src={pgBarGif.src} width={50} height={50} /> : buttonText}
                  </button>


                </div>


                {waitlistLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-[80%] absolute top-[5%] font-main place-self-center px-5 rounded-full p-2"
                    style={{
                      backgroundColor: "transparent",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <Progress
                      value={progress}
                      actualpgbarbgcolor={colors.readioOrange}
                      className="h-3"
                      style={{
                        backgroundColor: colors.readioBrown,
                        transition: 'all 0.2s ease-out'
                      }}
                    />
                  </motion.div>
                )}




                {/* {waitlistSuccess === true && waitlistLoading == true && ( */}
                {waitlistSuccess === true && waitlistLoading === false && (
                  <>
                    
                    <motion.div initial={{ opacity: 0, }} animate={{ opacity: 0.618, }} style={{ backgroundColor: colors.readioBrown, }} className='w-screen h-screen absolute z-[10] place-items-center place-content-center flex  place-self-center '>
                    </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1], // Custom bezier curve for a slow start, fast finish
                        }}  
                        style={{ backgroundColor: colors.readioDustyWhite }} 
                        className='w-[80%] h-[300px] absolute z-[15] font-main place-self-center px-5 rounded-lg p-2'
                      >
                        <div className="w-full h-full relative flex place-content-center place-items-center">
                          <X size={30} onClick={() => handleReset()} className='absolute p-1 cursor-pointer top-5 right-0' />
                          <p style={{ color: colors.readioBrown }} className='text-xs max-w-[80.8%] font-bold text-center'>{waitlistMessage}</p>
                        </div>
                      </motion.div>
                  </>
                )}

                {waitlistError === true && waitlistLoading == false && (
                  <>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='w-[80%] absolute top-[5%] font-main place-self-center px-5  rounded-full  p-2'>
                      <p style={{ color: colors.readioOrange }} className='text-xs font-bold text-center place-self--center'>{waitlistMessage}</p>
                    </motion.div>
                  </>
                )}

                {/* <p className='w-[85%] text-xs font-bold text-center text-[#32CD32]'>{waitlistMessage}</p> */}

              </div>

              <div className='w-full h-max flex flex-col gap-2 place-items-center place-content-center '>

                {/* <div className='w-[85%] flex gap-2 place-items-center  place-content-center'>
                  <AvatarCircles style={{borderColor: colors.readioWhite, width: '35px', height: '35px'}} numPeople={99} avatarUrls={avatars} />
                  <div 
                    className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                    style={{ marginLeft: '5px' }}
                    ></div>
                  <p className='text-xs' style={{ color: colors.readioWhite }}>people already on board!</p>
                </div> */}

                <div className='w-full font-main text-xs flex flex-col gap-1 opacity-[61.8%] absolute bottom-10 place-content-center place-items-center '>

                  <div className='w-full  flex gap-2 place-content-center place-items-center '>
                    <Image alt="logo" width={30} height={30} src={logo.src}></Image>
                    <p className='' style={{ color: colors.readioWhite }}>Lotus | Smart Audio For Students Of Life.</p>
                  </div>

                  <div className='w-full  flex gap-2 place-content-center place-items-center '>
                    <p className='' style={{ color: colors.readioWhite }}>In partnership with | </p>
                    <Image alt="diadora" width={40} height={40} src={diadora.src}></Image>
                    <Image alt="union" width={20} height={20} src={union.src}></Image>
                  </div>

                  {/* <p className='' style={{ color: colors.readioWhite }}>Download Lotus Now</p> */}

                </div>

              </div>

              {/* SECTION RIGHT */}
              {/* <div className='w-[50%] sm:flex hidden h-full flex place-items-center place-content-center'>
                <Image alt="phone" width={618} height={618}  src={phoneM.src}></Image>
              </div> */}

            </div>
          </div>
        </>
      )}


    </>
  );
}
