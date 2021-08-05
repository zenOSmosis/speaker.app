import React, { useEffect } from "react";
import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";
import LED from "@components/LED";

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
  onSelect: PropTypes.func.isRequired,

  isTesting: PropTypes.bool.isRequired,

  /**
   * Called when the user wishes to test the audio input device.
   */
  onTest: PropTypes.func.isRequired,
};

export default function AudioInputDevice({
  device,
  isSelected,
  onSelect,
  isTesting,
  onTest,
}) {
  useEffect(() => {
    if (device.kind !== "audioinput") {
      throw new TypeError(
        "AudioInputDevice can only be used with audioinput device kinds"
      );
    }
  }, [device]);

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
        cursor: "pointer",
        maxWidth: 720,
      }}
      // Fake button
      onClick={onSelect}
    >
      <div style={{ float: "right", display: "flex" }}>
        <button
          onClick={onSelect}
          style={{ backgroundColor: isSelected ? "green" : "inherit" }}
          title="Use this device for your audio input"
        >
          Select
        </button>
        <button
          onClick={evt => {
            // Prevent device from being selected when clicking on test button
            evt.stopPropagation();

            onTest();
          }}
          style={{ backgroundColor: isTesting ? "green" : "inherit" }}
          title="Check the audio levels of this device to determine if it is the audio input device you want to use"
        >
          Test
        </button>
        <AudioMediaStreamTrackLevelMeter style={{ height: 50 }} />
      </div>
      <div style={{ fontWeight: "bold" }}>
        <div>
          {device.label || (
            <span className="note">Device label unavailable</span>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 4 }}>
          <LED color={isSelected ? "green" : "gray"} />
        </div>
      </div>
    </div>
  );
}
