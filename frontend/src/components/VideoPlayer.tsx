import { Box, Center, Flex } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import { VideoContext } from "../contexts/VideoContext";

interface VideoPlayerProps {
  offset: number;
  selection: number[];
  updateVideoTime: (time: number) => void;
  updateMaxDuration: (duration: number) => void;
  updateSelection: (videoIDs: number[]) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  offset,
  selection,
  updateVideoTime,
  updateMaxDuration,
  updateSelection,
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const { isPlaying, isSeeking, currentTime, firstVideoOnPage, maxVideoID } =
    useContext(VideoContext);

  useEffect(() => {
    if (!ref.current) return;

    // If the seekbar is currently seeking
    if (isSeeking) {
      ref.current.pause();
      ref.current.currentTime = currentTime;
      return;
    }

    // If the video is paused
    if (!isPlaying) {
      ref.current.pause();
      return;
    }

    if (isPlaying && ref.current.paused) {
      ref.current.play().catch((e) => console.error("Play failed:", e));
    }
  }, [isPlaying, isSeeking, currentTime]);

  // Reload when page changes
  useEffect(() => {
    if (!ref.current) return;
    ref.current.load();
  }, [firstVideoOnPage, maxVideoID]);

  // Update the overall time to sync the Seekbar
  const onTimeUpdate = () => {
    if (!ref.current) return;
    updateVideoTime(ref.current.currentTime);
  };

  // Update the overall maximum duration
  const onLoadedMetadata = () => {
    if (!ref.current) return;
    updateMaxDuration(ref.current.duration);
  };

  const onSelect = () => {
    updateSelection([firstVideoOnPage + offset]);
  };

  // Output nothing if the the videoID is invalid
  if (firstVideoOnPage + offset >= maxVideoID) {
    return;
  }

  const selectionSet = new Set(selection);
  const selected: boolean = selectionSet.has(firstVideoOnPage + offset);
  const color: string = selected ? "white" : "gray";

  return (
    <Box
      bg={color}
      w="100%"
      h="100%"
      shadow="md"
      borderRadius="md"
      borderWidth="6px"
      borderColor={color}
      onClick={onSelect}
    >
      <Center>
        <Flex>
          <video
            width="512"
            ref={ref}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            loop
            autoPlay
            muted
            onClick={onSelect}
          >
            <source
              src={`http://localhost:8000/video/${
                firstVideoOnPage + offset
              }?t=${Date.now()}`}
              type="video/mp4"
              key={`${firstVideoOnPage + offset}-${Date.now()}`}
            />
          </video>
        </Flex>
      </Center>
    </Box>
  );
};

export default VideoPlayer;
