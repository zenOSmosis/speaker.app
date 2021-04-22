import React from "react";
import AudioMixer from "./AudioMixer";
import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";

export default function ControlledAudioMixer() {
  const { audioControllers } = useInputMediaDevicesContext();

  return (
    <AudioMixer
      channels={audioControllers.map((audioController) => ({
        channelName: audioController.getUuid(),
        isActive: !audioController.getIsMuted(),
        volumeLevel: audioController.getGain() * 100,
        mediaStream: audioController.getOutputMediaStream(),
        onChange: ({ volumeLevel, isActive }) => {
          audioController.setGain(volumeLevel / 100);
          audioController.setIsMuted(!isActive);
        },
      }))}
    />
  );
}
