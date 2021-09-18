import React, { useMemo } from "react";
import { LCD } from "@components/fontFaces";
import AdjustIcon from "@icons/AdjustIcon";
import ButtonTransparent from "@components/ButtonTransparent";
import { Knob } from "react-rotary-knob";

export default function TrackAdjuster({ track }) {
  const id = useMemo(() => track.getId(), [track]);
  const trackName = useMemo(() => track.getName(), [track]);

  return (
    <div
      key={id}
      style={{
        height: 52,
        padding: 1,
        border: "1px rgba(255,255,255,.2) solid",
        backgroundColor: "rgba(255,255,255,.1)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "left", fontWeight: "bold" }}>{trackName}</div>
      <div style={{ position: "absolute", top: -4, right: 0 }}>
        <span style={{ fontSize: ".7em" }}>Edit</span>{" "}
        <ButtonTransparent title={`Adjust ${trackName} Track`}>
          <AdjustIcon />
        </ButtonTransparent>
      </div>
      <div>
        <div style={{ display: "inline-block" }}>
          <div>
            <input type="checkbox" /> {/* TODO: Handle */}
          </div>
          <div>Solo</div>
        </div>
        <div
          style={{
            display: "inline-block",
            marginLeft: 2,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 44, top: 10 }}>
            <LCD style={{ color: "#14ce00" }}>08</LCD>
          </div>
          <div>
            <div
              style={{
                maxHeight: "1em",
                marginBottom: 8,
                transform: "scale(.4)",
              }}
            >
              <Knob
                defaultValue={1} // TODO: Obtain from track
                min={0}
                max={1}
                step={0.1}
                clampMin={0}
                clampMax={260}
                rotateDegrees={220}
                onChange={console.debug} // TODO: Set track
              />
            </div>
          </div>
          <div>Gain</div>
        </div>
      </div>
    </div>
  );
}
