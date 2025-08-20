import { createContext } from "react";

interface StateProps {
  isPlaying: boolean;
  isSeeking: boolean;
  currentTime: number;
  maxDuration: number;
  firstVideoOnPage: number;
  maxVideoID: number;
}

export const initialState: StateProps = {
  isPlaying: true,
  isSeeking: false,
  currentTime: 0,
  maxDuration: 0,
  firstVideoOnPage: 0,
  maxVideoID: 0,
};

export const VideoContext = createContext<StateProps>(initialState);
