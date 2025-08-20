import { Button, ChakraProvider, Flex, Grid, GridItem } from "@chakra-ui/react";
import { defaultSystem } from "@chakra-ui/react";
import { useState } from "react";
import Header from "./components/Header";
import VideoPlayer from "./components/VideoPlayer";
import { VideoContext } from "./contexts/VideoContext";
import Seekbar from "./components/Seekbar";

const maxVideos = 12;

function App() {
  const [video_count, setVideoCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [selection, setSelection] = useState<number[]>([]);

  // Video Context
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [maxDuration, setMaxDuration] = useState<number>(0);
  const [firstVideoOnPage, setFirstVideoOnPage] = useState<number>(0);

  const onPlayPressed = () => {
    setIsPlaying(!isPlaying);
  };

  const setPage = (page: number) => {
    const lastPage = Math.floor(video_count / maxVideos);
    if (page < 0) {
      page = 0;
    } else if (page > lastPage) {
      page = lastPage;
    }
    setPageNumber(page);

    console.log(`Page: ${page}`);

    setMaxDuration(0);
    setFirstVideoOnPage(page * maxVideos);
    console.log(`First Video On Page: ${firstVideoOnPage}`);
    setCurrentTime(0);
  };

  const onNextPressed = () => {
    setPage(pageNumber + 1);
  };

  const onPrevPressed = () => {
    setPage(pageNumber - 1);
  };

  const updateVideoTime = (time: number) => {
    setCurrentTime(time);
  };

  const updateMaxDuration = (duration: number) => {
    if (duration > maxDuration) {
      setMaxDuration(duration);
    }
  };

  const updateSelection = async (videoIDs: number[], force = false) => {
    const newSelection = new Set(selection);
    for (const vid of videoIDs) {
      if (newSelection.has(vid) && !force) {
        newSelection.delete(vid);
      } else {
        newSelection.add(vid);
      }
    }

    setSelection([...newSelection]);
  };

  const deleteSelection = async () => {
    const response = await fetch("http://localhost:8000/delete_video", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selection: selection }),
    });

    const data = await response.json();
    setVideoCount(data.video_count);

    setSelection([]);
  };

  const moveSelection = async () => {
    const response = await fetch("http://localhost:8000/move_video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selection: selection }),
    });

    const data = await response.json();
    setVideoCount(data.video_count);

    setSelection([]);
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Header
        setVideoCount={setVideoCount}
        updateSelection={updateSelection}
        deleteSelection={deleteSelection}
        moveSelection={moveSelection}
      />
      {video_count}

      <VideoContext
        value={{
          isPlaying: isPlaying,
          isSeeking: isSeeking,
          currentTime: currentTime,
          maxDuration: maxDuration,
          firstVideoOnPage: firstVideoOnPage,
          maxVideoID: video_count,
        }}
      >
        <Flex>
          <Button onClick={onPlayPressed}>Play/Pause</Button>
          <Button onClick={onPrevPressed}>Prev</Button>
          <Button onClick={onNextPressed}>Next</Button>
          <Seekbar
            setIsSeeking={setIsSeeking}
            setCurrentTime={setCurrentTime}
          />
        </Flex>
        <Grid
          templateRows="repeat(3, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={2}
        >
          {Array.from({ length: 12 }).map((_item, index) => (
            <GridItem key={index}>
              <VideoPlayer
                offset={index}
                selection={selection}
                updateVideoTime={updateVideoTime}
                updateMaxDuration={updateMaxDuration}
                updateSelection={updateSelection}
              />
            </GridItem>
          ))}
        </Grid>
      </VideoContext>
    </ChakraProvider>
  );
}

export default App;
