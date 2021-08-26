import React, { useEffect, useMemo } from "react";
import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";
import LED from "@components/LED";
import LabeledSwitch from "@components/labeled/LabeledSwitch";

import PropTypes from "prop-types";

AudioInputDevice.propTypes = {
  /**
   * The input audio device, as captured by the DOM.
   *
   * TODO: Use explicit type; improve doc
   */
  device: PropTypes.object.isRequired,

  isSelected: PropTypes.bool.isRequired,

  /**
   * Called when the user selects the device.
   */
  onToggleSelect: PropTypes.func.isRequired,

  isTesting: PropTypes.bool.isRequired,

  /**
   * Called when the user wishes to test the audio input device.
   */
  onToggleTest: PropTypes.func.isRequired,

  // TODO: Document
  isAudioNoiseSuppression: PropTypes.bool.isRequired,
  setIsAudioNoiseSuppression: PropTypes.func.isRequired,

  // TODO: Document
  isAudioEchoCancellation: PropTypes.bool.isRequired,
  setIsAudioEchoCancellation: PropTypes.func.isRequired,

  // TODO: Document
  isAudioAutoGainControl: PropTypes.bool.isRequired,
  setIsAudioAutoGainControl: PropTypes.func.isRequired,

  // TODO: Document
  mediaStreamTracks: PropTypes.arrayOf(PropTypes.instanceOf(MediaStreamTrack)),
};

export default function AudioInputDevice({
  device,
  isSelected,
  onToggleSelect,
  isTesting,
  onToggleTest,
  isAudioNoiseSuppression,
  setIsAudioNoiseSuppression,
  isAudioEchoCancellation,
  setIsAudioEchoCancellation,
  isAudioAutoGainControl,
  setIsAudioAutoGainControl,
  mediaStreamTracks,
}) {
  // Ensure device.kind is an audio input
  useEffect(() => {
    if (device.kind !== "audioinput") {
      throw new TypeError(
        "AudioInputDevice can only be used with audioinput device kinds"
      );
    }
  }, [device]);

  /**
   * @type {boolean} If true, the related audio stream is completely disabled.
   */
  const areAudioAdjustmentsDisabled = useMemo(
    () => !isSelected && !isTesting,
    [isSelected, isTesting]
  );

  /**
   * @type {string} The color of the LED and "broadcasting" state indicator
   */
  const activeStateColor = isSelected ? "green" : isTesting ? "yellow" : "gray";

  return (
    <div
      style={{
        textAlign: "left",
        padding: 8,
        margin: "2px auto",
        border: `1px rgba(255,255,255,${
          areAudioAdjustmentsDisabled ? ".2" : ".5"
        }) solid`,
        borderRadius: 4,
        overflow: "auto",
        position: "relative",
        backgroundColor: "rgba(0,0,0,.1)",
        color: "#bcb",
        maxWidth: 720,
      }}
      title={
        areAudioAdjustmentsDisabled
          ? `Press "Select" to broadcast or "Test" to monitor line input levels before broadcasting`
          : null
      }
    >
      <div
        style={{
          float: "right",
          display: "flex",
          marginTop: 10,
          whiteSpace: "nowrap",
        }}
      >
        <button
          onClick={onToggleSelect}
          style={{ backgroundColor: isSelected ? "green" : "inherit" }}
          title="Use this device for your audio input"
        >
          Select
        </button>
        &nbsp;
        <button
          onClick={onToggleTest}
          style={{
            backgroundColor: isTesting ? "#d6d600" : "inherit",
            color: isTesting ? "#000" : "inherit",
          }}
          title="Check the audio levels of this device to determine if it is the audio input device you want to use"
        >
          Test
        </button>
        &nbsp;
        <AudioMediaStreamTrackLevelMeter
          mediaStreamTracks={mediaStreamTracks}
          style={{ height: 50 }}
        />
      </div>
      <div>
        <div
          style={{
            fontWeight: "bold",
            color: areAudioAdjustmentsDisabled ? "gray" : "inherit",
          }}
        >
          <LED color={activeStateColor} />
          <span style={{ marginLeft: 8 }}>
            {device.label || (
              <span className="note">Device label unavailable</span>
            )}
          </span>
        </div>
        <div
          className="note"
          style={{
            marginLeft: 20,
            display: "inline-block",
            color: activeStateColor,
          }}
        >
          <span
            style={{
              backgroundColor: isSelected ? "#000" : "inherit",
              fontWeight: isSelected ? "bold" : "normal",
            }}
          >
            {areAudioAdjustmentsDisabled ? (
              "Not active"
            ) : isSelected ? (
              // TODO: Change string depending on whether currently connected to a network or not
              <>&nbsp;&nbsp;Broadcasting&nbsp;&nbsp;</>
            ) : (
              "Not broadcasting"
            )}
          </span>
        </div>
      </div>
      <div style={{ marginTop: 10, clear: "right", display: "inline-block" }}>
        <LabeledSwitch
          masterLabel="Noise Suppression"
          isOn={isAudioNoiseSuppression}
          onChange={setIsAudioNoiseSuppression}
          disabled={areAudioAdjustmentsDisabled}
        />
        <LabeledSwitch
          masterLabel="Echo Cancellation"
          isOn={isAudioEchoCancellation}
          onChange={setIsAudioEchoCancellation}
          disabled={areAudioAdjustmentsDisabled}
        />
        <LabeledSwitch
          masterLabel="Auto Gain Control"
          isOn={isAudioAutoGainControl}
          onChange={setIsAudioAutoGainControl}
          disabled={areAudioAdjustmentsDisabled}
        />
      </div>
    </div>
  );
}
