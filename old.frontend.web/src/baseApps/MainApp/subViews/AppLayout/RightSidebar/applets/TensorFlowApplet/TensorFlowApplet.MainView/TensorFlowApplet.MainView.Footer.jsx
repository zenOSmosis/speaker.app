import React, { forwardRef, useImperativeHandle, useState } from "react";
import LabeledKnob from "@components/LabeledKnob";

export default forwardRef(function TensorFlowAppletMainViewFooter(
  { elVideo },
  ref
) {
  const [renderState, setRenderState] = useState({
    fps: 0,
    pose: {
      keypoints: [],
      score: 0,
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      onPoseEstimate: (data) => {
        setRenderState(data);
      },
    }),
    []
  );

  if (!renderState) {
    return;
  }

  return (
    <div>
      {elVideo && (
        <LabeledKnob
          label="Video Opacity"
          defaultValue={0.2} // TODO: Obtain from state
          min={0}
          max={1}
          step={0.1}
          clampMin={0}
          clampMax={260}
          rotateDegrees={220}
          onChange={(opacity) => (elVideo.style.opacity = opacity)} // TODO: Handle
        />
      )}
      <div
        style={{
          verticalAlign: "bottom",
          display: "inline-block",
          fontSize: ".8em",
          color: "#ff4444",
          marginLeft: 10,
          paddingLeft: 10,
        }}
      >
        TensorFlow
        <div
          style={{
            display: "inline-block",
            margin: "0px 10px",
          }}
        >
          FPS: {renderState.fps.toFixed(2)}
        </div>
        <div
          style={{
            display: "inline-block",
            margin: "0px 5px",
          }}
        >
          Key Points:
          {renderState.pose.keypoints.length}
        </div>
        <div
          style={{
            display: "inline-block",
            margin: "0px 5px",
          }}
        >
          Score:
          {renderState.pose.score.toFixed(2)}
        </div>
      </div>
    </div>
  );
});
