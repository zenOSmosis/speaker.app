import React, { useCallback, useEffect, useRef, useState } from "react";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import Layout, { Content, Footer, Section } from "@components/Layout";

import TensorFlowAppletMainView from "./TensorFlowApplet.MainView";
import TensorFlowAppletColorPickerModal from "./TensorFlowApplet.ColorPickerModal";

import ButtonPanel from "@components/ButtonPanel";
import ButtonTransparent from "@components/ButtonTransparent";
import ColorSwatch from "@components/ColorSwatch";
import Center from "@components/Center";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading";
import LabeledSwitch from "@components/LabeledSwitch";
import LabeledSelect from "@components/LabeledSelect";

import AdvancedIcon from "@icons/AdvancedIcon";
import SimpleIcon from "@icons/SimpleIcon";

import useVideoPoseNet from "./hooks/useVideoPoseNet";
import setupCamera from "./utils/setupCamera";

import { SYNC_EVT_TENSOR_FLOW_POSENET_POSE } from "@shared/syncEvents";

// TODO: Borrow from:
//    - https://github.com/yoyota/react-posenet/blob/master/src/components/PoseNet.js
//    - https://github.com/tensorflow/tfjs-models/blob/master/posenet/demos/camera.js

// TODO: Stop camera on unrender (Phase I)

const LAYOUT_TYPE_SIMPLE = "simple";
const LAYOUT_TYPE_ADVANCED = "advanced";

export default function TensorFlowApplet({ zenRTCPeer, isZenRTCConnected }) {
  const [layoutType, setLayoutType] = useState(LAYOUT_TYPE_SIMPLE);

  const { setMainView, setModalView } = useAppLayoutContext();

  const [videoMediaStreamTrack, setVideoMediaStreamTrack] = useState(null);

  // HTML color (i.e. "yellow", "#ffff00", rgb(255,255,0))
  const [captureColor, setCaptureColor] = useState("yellow");

  const refVideoMediaStreamTrack = useRef(null);
  refVideoMediaStreamTrack.current = videoMediaStreamTrack;

  // Reset main view and stop local camera when applet exits
  useEffect(() => {
    return function unmount() {
      if (refVideoMediaStreamTrack && refVideoMediaStreamTrack.current) {
        refVideoMediaStreamTrack.current.stop();
      }
    };
  }, [setMainView]);

  const handleCameraSetup = useCallback(async () => {
    const videoMediaStreamTrack = await setupCamera();

    // TODO: Remove
    console.log({
      videoMediaStreamTrack,
      settings: videoMediaStreamTrack.getSettings(),
      // capabilities: videoMediaStreamTrack.getCapabilities(),
      constraints: videoMediaStreamTrack.getConstraints(),
    });

    setVideoMediaStreamTrack(videoMediaStreamTrack);
  }, []);

  const [isTracking, setIsTracking] = useState(false);

  const [poseNetConfig /* _setPoseNetConfig */] = useState({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });

  // Wrapper for _setPoseNetConfig so that all configuration settings can be made at once
  /*
  const setPoseNetConfig = useCallback((updatedConfig) => {
    _setPoseNetConfig((config) => {
      const mergedConfig = {
        ...config,
        ...updatedConfig,
      };

      // Type-cast from form strings to floats
      mergedConfig.outputStride = parseFloat(mergedConfig.outputStride);
      mergedConfig.multiplier = parseFloat(mergedConfig.multiplier);
      mergedConfig.quantBytes = parseFloat(mergedConfig.quantBytes);

      return mergedConfig;
    });
  }, []);
  */

  const refMainView = useRef(null);

  const { isLoading, elVideo } = useVideoPoseNet({
    videoMediaStreamTrack,
    isTracking,
    ...poseNetConfig,
    onPoseEstimate: (data) => {
      data.color = captureColor;

      // Handle pose broadcasting
      //
      // TODO: Handle more appropriately
      if (isTracking && isZenRTCConnected) {
        zenRTCPeer.emitSyncEvent(SYNC_EVT_TENSOR_FLOW_POSENET_POSE, data);
      }

      if (refMainView.current) {
        refMainView.current.onPoseEstimate(data);
      }
    },
  });

  const handleShowCameraOutput = useCallback(
    (shouldShow) => {
      if (shouldShow) {
        setMainView(() => (
          <TensorFlowAppletMainView ref={refMainView} elVideo={elVideo} />
        ));
      } else {
        setMainView(null);
      }
    },
    [elVideo, setMainView]
  );

  // TODO: Removediv
  useEffect(() => {
    handleShowCameraOutput(true);
  }, [handleShowCameraOutput]);

  if (isLoading) {
    return (
      <Center>
        <StaggeredWaveLoading />
      </Center>
    );
  }

  return (
    <Layout>
      <Content>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <Section>
            <h1>Camera / Video</h1>
            <LabeledSwitch
              labelOff="Off"
              labelOn="On"
              masterLabel="Camera"
              isOn={!!videoMediaStreamTrack}
              onChange={() => {
                if (!videoMediaStreamTrack) {
                  handleCameraSetup();

                  // TODO: Start watching automatically
                } else {
                  videoMediaStreamTrack.stop();

                  setVideoMediaStreamTrack(null);
                }
              }}
            />

            {/*
              <LabeledSwitch
                labelOff="No"
                labelOn="Yes"
                masterLabel="Monitoring"
              />
              */}

            {/*
              {layoutType === LAYOUT_TYPE_ADVANCED && (
                <LabeledSwitch
                  labelOff="No"
                  labelOn="Yes"
                  masterLabel="Horizontal Flip"
                  disabled
                />
              )}
              */}

            <div>
              <div className="note">
                Note that video is not shared w/ other participants.
              </div>
            </div>
          </Section>

          <Section>
            <h1 style={!videoMediaStreamTrack ? { color: "gray" } : {}}>
              TensorFlow
            </h1>

            <div>
              <div>
                <LabeledSwitch
                  labelOff="Off"
                  labelOn="On"
                  masterLabel="Activation"
                  onChange={(isOn) => {
                    if (!videoMediaStreamTrack) {
                      setIsTracking(false);
                    } else {
                      setIsTracking(isOn);
                    }
                  }}
                  isOn={isTracking}
                  disabled={!videoMediaStreamTrack}
                />
                <LabeledSwitch
                  labelOff="No"
                  labelOn="Yes"
                  masterLabel="Sharing"
                  disabled
                />
                <ButtonTransparent
                  disabled={!videoMediaStreamTrack}
                  onClick={() =>
                    setModalView(() => (
                      <TensorFlowAppletColorPickerModal
                        onClose={() => setModalView(null)}
                        onChange={setCaptureColor}
                      />
                    ))
                  }
                >
                  <ColorSwatch
                    color={!videoMediaStreamTrack ? "gray" : captureColor}
                  />{" "}
                  Choose Color
                </ButtonTransparent>
              </div>
            </div>

            {layoutType === LAYOUT_TYPE_ADVANCED && (
              <Section>
                <h2 style={!videoMediaStreamTrack ? { color: "gray" } : {}}>
                  PoseNet
                </h2>

                <div>
                  <LabeledSwitch
                    labelOff="MobileNetV1"
                    labelOn="ResNet50"
                    masterLabel="Architecture"
                    disabled
                  />

                  <LabeledSwitch
                    labelOff="Single Person"
                    labelOn="Multi Person"
                    masterLabel="Capture Type"
                    disabled
                  />
                </div>

                <div>
                  <LabeledSelect label="Min. Confidence" disabled>
                    <option value=".1">.1</option>
                  </LabeledSelect>

                  {
                    // TODO: (Stride 16, 32 are supported for the ResNet architecture and stride 8, 16, 32 are supported for the MobileNetV1 architecture).
                  }
                  <LabeledSelect label="Output Stride" disabled>
                    <option value="8">8</option>
                    <option value="16">16</option>
                    <option value="32">32</option>
                  </LabeledSelect>
                </div>
                <div>
                  {
                    // TODO: The value is used only by the MobileNetV1 architecture and not by the ResNet architecture
                  }
                  <LabeledSelect label="Multiplier" disabled>
                    <option value="1.01">1.01</option>
                    <option value="1.0">1.0</option>
                    <option value=".75">.75</option>
                    <option value=".50">.50</option>
                  </LabeledSelect>
                </div>
                <div>
                  {
                    // TODO: (Stride 16, 32 are supported for the ResNet architecture and stride 8, 16, 32 are supported for the MobileNetV1 architecture).
                  }
                  <LabeledSelect label="Quant Bytes" disabled>
                    <option value="4">4 bytes per float</option>
                    <option value="2">2 bytes per float</option>
                    <option value="1">1 byte per float</option>
                  </LabeledSelect>
                </div>
              </Section>
            )}
          </Section>
        </div>
      </Content>
      <Footer
        style={{
          borderTop: "1px rgba(255,255,255,.4) solid",
          backgroundColor: "rgba(0,0,0,.4)",
        }}
      >
        <ButtonPanel
          buttons={[
            {
              content: () => (
                <React.Fragment>
                  Simple{" "}
                  <SimpleIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                </React.Fragment>
              ),
              onClick: () => setLayoutType(LAYOUT_TYPE_SIMPLE),
            },
            {
              content: () => (
                <React.Fragment>
                  Advanced{" "}
                  <AdvancedIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                </React.Fragment>
              ),
              onClick: () => setLayoutType(LAYOUT_TYPE_ADVANCED),
            },
          ]}
          defaultSelectedIdx={[
            LAYOUT_TYPE_SIMPLE,
            LAYOUT_TYPE_ADVANCED,
          ].indexOf(layoutType)}
        />
      </Footer>
    </Layout>
  );
}
