import { useCallback, useState, useEffect, useRef } from "react";
import Track, { EVT_UPDATED } from "../utils/TrackModel";
import { getPercussionInstruments } from "@shared/midi/midiInstruments";

/**
 * Creates, and manages, Track instances for the Audio Looper.
 */
export default function useAudioLoopCreatorSession({ onPlayNote }) {
  const [tracks, _setTracks] = useState([]);

  useEffect(() => {
    Track.setBeatHandler(({ note, instrumentId, octaveIdx }) => {
      onPlayNote({ note, instrumentId, octaveIdx });
    });
  }, [onPlayNote]);

  /**
   * @return {Track}
   */
  const addTrack = useCallback(({ name, ...rest }) => {
    const newTrack = new Track({ name, ...rest });

    _setTracks((tracks) => [...tracks, newTrack]);

    return newTrack;
  }, []);

  // TODO: Handle accordingly; default instruments
  useEffect(() => {
    const percussionInstruments = getPercussionInstruments();

    for (const instrument of percussionInstruments) {
      addTrack({ instrument });
    }
  }, [addTrack]);

  useEffect(() => {
    const handleTracksUpdate = () => {
      _setTracks((tracks) => [...tracks]);
    };

    for (const track of tracks) {
      track.on(EVT_UPDATED, handleTracksUpdate);
    }

    return function unmount() {
      for (const track of tracks) {
        track.off(EVT_UPDATED, handleTracksUpdate);
      }
    };
  }, [tracks]);

  const refTracks = useRef(tracks);
  refTracks.current = tracks;

  /*
  useEffect(() => {
    
  }, [currentBeatIdx]);
  */

  const setCurrentBeatIdx = useCallback((currentBeatIdx) => {
    const tracks = refTracks.current;

    for (const track of tracks) {
      track.setCurrentBeatIdx(currentBeatIdx);
    }
  }, []);

  /*
  const toggleInstrumentNoteAtTimeIdx = useCallback(
    ({ instrumentId, note, octaveIdx, timeIdx }) => {
      // TODO: Handle
      console.log({
        instrumentId,
        note,
        octaveIdx,
        timeIdx,
      });
    },
    []
  );
  */

  /*
  return {
    toggleInstrumentNoteAtTimeIdx,
  };
  */

  return {
    addTrack,
    tracks,
    setCurrentBeatIdx,
  };
}
