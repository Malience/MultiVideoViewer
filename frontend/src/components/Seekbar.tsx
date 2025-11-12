import { useContext, useEffect, useState } from "react";
import { VideoContext } from "../contexts/VideoContext";
import { Slider, type SliderValueChangeDetails } from "@chakra-ui/react";

interface SeekbarProps {
  setIsSeeking: (seeking: boolean) => void;
  setCurrentTime: (time: number) => void;
}

const Seekbar: React.FC<SeekbarProps> = ({ setIsSeeking, setCurrentTime }) => {
  const { isSeeking, currentTime, maxDuration } = useContext(VideoContext);
  const [value, setValue] = useState<number[]>([0]);

  const onValueChange = (details: SliderValueChangeDetails) => {
    setIsSeeking(true);
    const curTime = (details.value[0] / 100) * maxDuration;
    setCurrentTime(curTime);
  };

  const onValueChangeEnd = (details: SliderValueChangeDetails) => {
    const curTime = (details.value[0] / 100) * maxDuration;
    setCurrentTime(curTime);
    setIsSeeking(false);
  };

  useEffect(() => {
    if (isSeeking) return;
    setValue([(currentTime / maxDuration) * 100]);
  }, [isSeeking, currentTime, maxDuration]);

  // TODO: Set width to 100% when properly set up
  return (
    <Slider.Root
      key="red"
      colorPalette="red"
      width="70%"
      onValueChange={onValueChange}
      onValueChangeEnd={onValueChangeEnd}
      value={value}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0}>
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
  );
};

export default Seekbar;
