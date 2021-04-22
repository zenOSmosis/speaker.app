import React, { useMemo, useImperativeHandle, useRef, forwardRef } from "react";
import { getAdjacentKeyPoints } from "@tensorflow-models/posenet";
import DOMElement from "@components/DOMElement";

export default forwardRef(function RenderCanvas({ ...rest }, ref) {
  const refCtx = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      onPoseEstimate: ({ pose, fps, color = "yellow" }) => {
        const { keypoints } = pose;

        refCtx.current.clearRect(0, 0, 640, 480);

        drawSkeleton(keypoints, 0.23, refCtx.current, 1, color);
        drawKeypoints(keypoints, 0.23, refCtx.current, 1, color);
      },
    }),
    []
  );

  const elCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");

    // TODO: Make these configurable
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext("2d");
    refCtx.current = ctx;

    // TODO: Set up any canvas properties and bindings here

    return canvas;
  }, []);

  return <DOMElement el={elCanvas} />;
});

// @see https://github.com/tensorflow/tfjs-models/blob/master/posenet/demos/demo_util.js

function toTuple({ y, x }) {
  return [y, x];
}

function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 4; //  lineWidth; TODO: Make dynamic
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1, color) {
  const adjacentKeyPoints = getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      scale,
      ctx
    );
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1, color) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}
