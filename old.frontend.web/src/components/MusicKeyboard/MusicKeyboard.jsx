import React, { useCallback } from "react";
import { ReactComponent as MusicKeyboardSVG } from "./music-keyboard.svg";
import AutoScaler from "../AutoScaler";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useMusicInstrumentChannel from "@hooks/useMusicInstrumentChannel";

import { SYNC_EVT_MIDI_NOTE } from "@shared/syncEvents";

// TODO: See alternative keyboard https://codepen.io/hanslindetorp/pen/dyogyxg

export default function MusicKeyboard() {
  const { zenRTCPeer, isConnected } = useWebPhantomSessionContext();

  const {
    // isSustain,
    // toggleSustain,
    octaveIdx,
    // setOctaveIdx,
    // decreaseOctaveIdx,
    // increaseOctaveIdx,
    instrumentId,
    // setInstrumentId,
    volume,
    // setVolume,
    // stringedInstruments,
  } = useMusicInstrumentChannel();

  /**
   * Converts music keyboard note so it can map w/ getMIDINumber
   *
   * @param {string}
   * @return {string}
   */
  const getNormalizedNote = useCallback((svgElementId) => {
    return svgElementId
      .toUpperCase()
      .replace("NOTE-", "")
      .replace("-SHARP", "#");
  }, []);

  /**
   * Plays the given note out Phantom Server.
   *
   * TODO: Rework this so volume control / etc works w/ music applet.
   * (Create context for it?)
   *
   * @param {string} note
   * @param {boolean} release? [default=false]
   */
  const playNote = useCallback(
    (note, release = false) => {
      if (isConnected) {
        zenRTCPeer.emitSyncEvent(SYNC_EVT_MIDI_NOTE, {
          note,
          octaveIdx,
          instrumentId,
          release,
          volume,
        });
      }
    },
    [zenRTCPeer, isConnected, octaveIdx, instrumentId, volume]
  );

  const handlePress = useCallback(
    (evt) => {
      evt.stopPropagation();

      playNote(getNormalizedNote(evt.target.id));
    },
    [playNote, getNormalizedNote]
  );

  const handleUnpress = useCallback(
    (evt) => {
      evt.stopPropagation();

      // TODO: Handle release / sustain
      // playNote(getNormalizedNote(evt.target.id), true);
    },
    [
      /*playNote, getNormalizedNote*/
    ]
  );

  return (
    <AutoScaler>
      <MusicKeyboardSVG
        onMouseDown={handlePress}
        onMouseOver={handlePress} // TODO: Only trigger if actively pressed
        onMouseUp={handleUnpress}

        // TODO: Add touch events
      />
    </AutoScaler>
  );
}
