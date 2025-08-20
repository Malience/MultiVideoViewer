import React, { useContext, useEffect, useState } from "react";
import { Flex, Button } from "@chakra-ui/react";
import { VideoContext } from "../contexts/VideoContext";

interface HeaderProps {
  setVideoCount: (video_count: number) => void;
  updateSelection: (videoIDs: number[], force: boolean) => void;
  deleteSelection: () => void;
  moveSelection: () => void;
}

const Header: React.FC<HeaderProps> = ({
  setVideoCount,
  updateSelection,
  deleteSelection,
  moveSelection,
}) => {
  const [src_directory, setSrcDir] = useState("");
  const [dst_directory, setDstDir] = useState("");
  const { firstVideoOnPage } = useContext(VideoContext);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => {
        setSrcDir(data.src_directory);
        setDstDir(data.dst_directory);
        setVideoCount(data.video_count);
      });
  }, [setVideoCount]);

  const setSource = async () => {
    console.log("Set Source!");
    const response = await fetch("http://localhost:8000/set_source", {
      method: "POST",
    });

    const data = await response.json();
    setSrcDir(data.src_directory);
    setVideoCount(data.video_count);
  };

  const setDestination = async () => {
    console.log("Set Destination!");

    const response = await fetch("http://localhost:8000/set_destination", {
      method: "POST",
    });

    const data = await response.json();
    setDstDir(data.dst_directory);
  };

  const selectAll = async () => {
    const newSelection: number[] = [];
    for (let i = 0; i < 12; i++) {
      newSelection.push(firstVideoOnPage + i);
    }
    updateSelection(newSelection, false);
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      padding="1rem"
      bg="gray.400"
      width="100%"
      zIndex="1000"
    >
      <Flex as="nav" mr={5} direction="column">
        <Flex>
          <Button onClick={setSource}>Set Source</Button>
          {src_directory}
        </Flex>
        <Flex>
          <Button onClick={setDestination}>Set Destination</Button>
          {dst_directory}
        </Flex>
        <Flex>
          <Button onClick={selectAll}>Select All</Button>
          <Button onClick={deleteSelection}>Delete</Button>
          <Button onClick={moveSelection}>Move</Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
