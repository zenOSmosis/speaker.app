import React, { forwardRef, useRef, useImperativeHandle } from "react";
import TensorFlowAppletMainViewFooter from "./TensorFlowApplet.MainView.Footer";
import Layout, { Content, Footer } from "@components/Layout";
import Center from "@components/Center";
import Full from "@components/Full";
import Cover from "@components/Cover";
import DOMElement from "@components/DOMElement";
import RenderCanvas from "./RenderCanvas";
import AutoScaler from "@components/AutoScaler";

import tensorFlowSVG from "@icons/svg/tensorflow-ar21.svg";

// TODO: Refactor so that portions of this can overlay outside of TensorFlow app
export default forwardRef(function TensorFlowAppletMainView({ elVideo }, ref) {
  const refRenderCanvas = useRef(null);
  const refFooter = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      onPoseEstimate: (data) => {
        if (refRenderCanvas) {
          refRenderCanvas.current.onPoseEstimate(data);
        }

        if (refFooter) {
          refFooter.current.onPoseEstimate(data);
        }
      },
    }),
    []
  );

  return (
    <Full>
      {elVideo && (
        <Cover>
          <AutoScaler>
            <DOMElement
              el={elVideo}
              onMount={() => {
                elVideo.style.opacity = ".2";
                elVideo.play().catch((err) => console.warn("Caught", err));
              }}
              onBeforeUnmount={() => {
                elVideo.pause();
              }}
            />
          </AutoScaler>
        </Cover>
      )}
      <Cover>
        <AutoScaler>
          <RenderCanvas ref={refRenderCanvas} />
        </AutoScaler>
      </Cover>
      <Cover>
        <Center>
          {
            // TODO: Fade out if video track is present
          }
          <img
            src={tensorFlowSVG}
            alt="TensorFlow"
            style={{ width: "80%", height: "80%" }}
            className="animate__animated animate__flipInX"
          />
          {/*
            <div>
            TODO: Prototype hand movement to instrument playing
            <div style={{ fontSize: "8vh" }}>D# / Eb</div>
          </div>
            */}
        </Center>
      </Cover>
      <Cover>
        <Layout>
          <Content></Content>
          <Footer style={{ textAlign: "left" }}>
            <TensorFlowAppletMainViewFooter ref={refFooter} elVideo={elVideo} />
          </Footer>
        </Layout>
      </Cover>
    </Full>
  );
});
