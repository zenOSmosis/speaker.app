import React, { useEffect, useState } from "react";
import { fabric } from "fabric";

/**
 * Fix issue on iOS 13 where ResizeObserver isn't available.
 */
import { install } from "resize-observer";
if (!window.ResizeObserver) {
  install();
}

// TODO: Show main app background as background to this view so the scaling matches
export default function DrawCanvas() {
  const [elWrap, setElWrap] = useState(null);
  const [elCanvas, setElCanvas] = useState(null);

  // Handle instantiating and disposing of fabric canvas
  useEffect(() => {
    if (elWrap && elCanvas) {
      const c = new fabric.Canvas(elCanvas, {
        isDrawingMode: true,
      });

      let isDrawing = false;

      c.on("mouse:down", (evt) => {
        isDrawing = true;
      });

      c.on("mouse:up", (evt) => {
        isDrawing = false;
      });

      c.on("mouse:move", (evt) => {
        if (isDrawing) {
          console.log({ evt });

          console.log({ json: c.toJSON() });
        }
      });

      // Adjust the canvas size to match the wrapper size
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.target.offsetWidth;
          const height = entry.target.offsetHeight;

          c.setWidth(width);
          c.setHeight(height);
        }
      });

      ro.observe(elWrap);

      return function unmount() {
        ro.unobserve(elWrap);

        c.dispose();
      };
    }
  }, [elWrap, elCanvas]);

  return (
    <div
      ref={setElWrap}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,.4)",
      }}
    >
      {
        // TODO: Make height / width dynamic
      }
      <canvas ref={setElCanvas} width={500} height={500}></canvas>
    </div>
  );
}
