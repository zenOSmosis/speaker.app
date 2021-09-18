import React, { useCallback } from "react";
import AudioLoopCreator from "./AudioLoopCreator";
// import Center from "@components/Center";
import { SYNC_EVT_MIDI_NOTE } from "@shared/syncEvents";

export default function AudioLoopCreatorController({
  zenRTCPeer,
  isZenRTCConnected,
  onClose,
  ...rest
}) {
  const handlePlayNote = useCallback(
    ({ ...args }) => {
      if (isZenRTCConnected) {
        zenRTCPeer.emitSyncEvent(SYNC_EVT_MIDI_NOTE, {
          ...args,
        });
      }
    },
    [zenRTCPeer, isZenRTCConnected]
  );

  /*
  if (!isZenRTCConnected) {
    return <Center>Not connected</Center>;
  }
  */

  return (
    <AudioLoopCreator onPlayNote={handlePlayNote} onClose={onClose} {...rest} />
  );
}
