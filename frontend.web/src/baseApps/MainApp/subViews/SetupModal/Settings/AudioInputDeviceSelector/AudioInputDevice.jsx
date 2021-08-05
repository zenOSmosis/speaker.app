import React, { useEffect } from "react";
import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";
import LED from "@components/LED";

export default function AudioInputDevice({ device }) {
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
        margin: "2px 8px",
        border: "1px rgba(255,255,255,.2) solid",
        borderRadius: 4,
        overflow: "auto",
        position: "relative",
        backgroundColor: "rgba(0,0,0,.1)",
        color: "#bcb",
      }}
    >
      <div style={{ float: "right", display: "flex" }}>
        <button>Select</button>
        <button>Test</button>
        <AudioMediaStreamTrackLevelMeter style={{ height: 50 }} />
      </div>
      <div style={{ fontWeight: "bold" }}>
        <div>
          {device.label || (
            <span className="note">Device label unavailable</span>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 4 }}>
          {
            // TODO: Dynamically apply gray / green coloring
          }
          <LED color="gray" />
        </div>
      </div>
    </div>
  );
}
