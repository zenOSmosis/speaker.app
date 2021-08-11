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
  setIsAudioAutoGainControl: PropTypes.bool.isRequired,
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
    () => isSelected || !isTesting,
    [isSelected, isTesting]
  );

  return (
    <div
      style={{
        textAlign: "left",
        padding: 8,
        margin: "2px auto",
        border: "1px rgba(255,255,255,.2) solid",
        borderRadius: 4,
        overflow: "auto",
        position: "relative",
        backgroundColor: !isSelected
          ? "rgba(0,0,0,.1)"
          : "rgba(255,255,255,.1)",
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
          style={{ backgroundColor: isTesting ? "green" : "inherit" }}
          title="Check the audio levels of this device to determine if it is the audio input device you want to use"
        >
          Test
        </button>
        &nbsp;
        <AudioMediaStreamTrackLevelMeter style={{ height: 50 }} />
      </div>
      <div>
        <div style={{ fontWeight: "bold" }}>
          <LED color={isSelected ? "green" : isTesting ? "yellow" : "gray"} />
          <span style={{ marginLeft: 8 }}>
            {device.label || (
              <span className="note">Device label unavailable</span>
            )}
          </span>
        </div>
        <div
          className="note"
          style={{ marginLeft: 20, display: "inline-block" }}
        >
          {isSelected ? "Broadcasting" : "Not broadcasting"}
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
