import React, { Fragment, useCallback, useMemo, useRef, useState } from "react";
import Layout, { Header, Content, Footer } from "../Layout";
import Cover from "@components/Cover";
import AudioLoopCreatorHeader from "./AudioLoopCreator.Header";
import AudioLoopCreatorMainContent from "./AudioLoopCreator.MainContent";
import AudioLoopCreatorFooter from "./AudioLoopCreator.Footer";
import TrackEditor from "./AudioLoopCreator.TrackEditor";
import styles from "./AudioLoopCreator.module.css";
import useTimingController from "./hooks/useTimingController";
import useSessionController from "./hooks/useSessionController";
// import useKeyboardEvents from "@hooks/useKeyboardEvents";
import getSecondsToHHMMSS from "@shared/time/getSecondsToHHMMSS";

export default function AudioLoopCreator({
  onClose = () => console.debug("close"),
  onPlayNote = ({ note, instrumentId, octaveIdx }) =>
    console.debug({
      note,
      instrumentId,
      octaveIdx,
    }),
  // TODO: Integrate
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  const [beatsPerMinute, setBeatsPerMinute] = useState(120);

  /*
  useKeyboardEvents({
    onKeyDown: (key) => console.log("keydown", key),
    onKeyUp: (key) => console.log("keyup", key),
    isEnabled: true,
  });
  */

  // For time signature (TODO: Rename)
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [beatType, setBeatType] = useState(4);

  const refAudioLoopCreatorHeader = useRef(null);
  const refAudioLoopCreatorMainContent = useRef(null);
  const refAudioLoopCreatorFooter = useRef(null);

  const { addTrack, tracks, setCurrentBeatIdx } = useSessionController({
    onPlayNote,
  });

  const { beatsPerSecond, pageDuration, lenBeats } = useTimingController({
    isPlaying,
    isLooping,
    beatsPerMinute,

    // Time signature
    // TODO: Auto-fill
    beatsPerBar,
    beatType,

    onProgress: ({ percentage, beatIdx, currentBarBeat }) => {
      setCurrentBeatIdx(beatIdx);

      refAudioLoopCreatorHeader.current.onProgress({
        percentage,
        beatIdx,
        currentBarBeat,
      });

      refAudioLoopCreatorMainContent.current.onProgress({
        percentage,
        beatIdx,
        currentBarBeat,
      });

      refAudioLoopCreatorFooter.current.onProgress({
        percentage,
        beatIdx,
        currentBarBeat,
      });
    },

    onComplete: () => setIsPlaying(false),
  });

  const [isAddingTrack, _setIsAddingTrack] = useState(false);

  const handleInitAddTrack = useCallback(() => {
    _setIsAddingTrack(true);
  }, []);

  const handleAddTrack = useCallback(
    ({ instrumentId, ...args }) => {
      const track = addTrack({ instrumentId, ...args });

      if (track) {
        _setIsAddingTrack(false);
      }
    },
    [addTrack]
  );

  const handleTrackEditorClose = useCallback(() => {
    _setIsAddingTrack(false);
  }, []);

  // TODO: Move to useTimingController
  const pageMMSS = useMemo(
    () => pageDuration && getSecondsToHHMMSS(pageDuration / 1000),
    [pageDuration]
  );

  return (
    <Fragment>
      <Layout className={styles["audio-loop-creator"]}>
        <Header>
          <AudioLoopCreatorHeader
            ref={refAudioLoopCreatorHeader}
            onAddTrack={handleInitAddTrack}
            isPlaying={isPlaying}
            onSetIsPlaying={setIsPlaying}
            isLooping={isLooping}
            onSetIsLooping={setIsLooping}
            beatsPerBar={beatsPerBar}
            onSetBeatsPerBar={setBeatsPerBar}
            beatType={beatType}
            onSetBeatType={setBeatType}
            beatsPerMinute={beatsPerMinute}
            onSetBeatsPerMinute={setBeatsPerMinute}
            onClose={onClose}
          />
        </Header>
        <Content>
          <AudioLoopCreatorMainContent
            ref={refAudioLoopCreatorMainContent}
            tracks={tracks}
            lenBeats={lenBeats}
            beatsPerBar={beatsPerBar}
            styles={styles}
          />
        </Content>
        <Footer>
          <AudioLoopCreatorFooter
            ref={refAudioLoopCreatorFooter}
            pageMMSS={pageMMSS}
            lenBeats={lenBeats}
            beatsPerSecond={beatsPerSecond}
            isLooping={isLooping}
          />
        </Footer>
      </Layout>

      {isAddingTrack && (
        <Cover style={{ backgroundColor: "rgba(0,0,0,.7)" }}>
          <TrackEditor
            isNewTrack={true}
            onSaveTrack={handleAddTrack}
            onClose={handleTrackEditorClose}
          />
        </Cover>
      )}
    </Fragment>
  );
}
