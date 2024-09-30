import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { MdPlayCircle, MdPauseCircle } from 'react-icons/md';
import { Button } from "@/components/ui/button";
import ReadioTalkBadge from "./readio-talk-badge";

// Utility function to format time in MM:SS format
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

interface ReadioAudioControllerProps {
  audioSrc: string;
  className?: string;
}

const ReadioAudioController: React.FC<ReadioAudioControllerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio) {
        const audioDuration = audio.duration;
        // Ensure the duration is a finite number before setting it
        if (isFinite(audioDuration)) {
          setDuration(audioDuration);
        } else {
          setDuration(0); // Default to 0 if the duration is not valid
        }
      }
    };

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    if (audio) {
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      // Cleanup event listeners on component unmount
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeekBarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && duration) { // Check if audio and duration are valid
      const newTime = (Number(event.target.value) / 100) * duration;
      if (isFinite(newTime)) { // Ensure newTime is a valid number
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  return (
    <div className="audio-player w-full flex place-items-center place-content-center justify-center gap-4 p-4 rounded-lg">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      <div className="time-control w-full flex items-center justify-between">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={(duration ? (currentTime / duration) * 100 : 0)}
          onChange={handleSeekBarChange}
          className="w-full mx-4"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ReadioAudioController;
