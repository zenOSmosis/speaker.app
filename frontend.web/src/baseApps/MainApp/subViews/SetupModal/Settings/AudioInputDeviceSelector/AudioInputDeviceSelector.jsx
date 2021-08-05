import React, { useEffect, useState } from "react";
import ButtonTransparent from "@components/ButtonTransparent";
import Center from "@components/Center";
import Layout, { Content, Footer } from "@components/Layout";
import LabeledSwitch from "@components/labeled/LabeledSwitch";
import Full from "@components/Full";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading/StaggeredWaveLoading";

import AudioInputDevice from "./AudioInputDevice";

import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";

import classNames from "classnames";
import styles from "./AudioInputDeviceSelector.module.css";

// TODO: Show audio meter for selected audio device

export default function AudioInputDeviceSelector() {
  const [isFetchingInputMediaDevices, setIsFetchingInputMediaDevices] =
    useState(false);
  const [inputMediaDevices, setInputMediaDevices] = useState([]);
  const [inputMediaDevicesError, setInputMediaDevicesError] = useState(null);

  const {
    fetchMediaInputDevices,
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
  } = useInputMediaDevicesContext();

  useEffect(() => {
    setIsFetchingInputMediaDevices(true);

    fetchMediaInputDevices()
      .then(inputMediaDevices =>
        setInputMediaDevices(
          inputMediaDevices.filter(({ kind }) => kind === "audioinput")
        )
      )
      .catch(err => {
        console.error(err);

        setInputMediaDevicesError(err);
      })
      .finally(() => {
        setIsFetchingInputMediaDevices(false);
      });
  }, [fetchMediaInputDevices]);

  if (inputMediaDevicesError) {
    return (
      <Center style={{ fontWeight: "bold" }}>
        Cannot obtain media devices. Do you have permissions blocked to access
        them?
      </Center>
    );
  }

  return (
    <Full>
      <Layout>
        <Content style={{ overflow: "auto" }}>
          <div style={{ textAlign: "left" }}>
            <h1>Audio Input Device Selector</h1>
            {/*
              <p>Choose default audio device when starting new calls.</p>
              <p className="note">
                NOTE: Default audio device selection may not persist accurately
                when starting new sessions.
              </p>
            */}
          </div>

          {isFetchingInputMediaDevices ? (
            <StaggeredWaveLoading />
          ) : (
            <div className={styles["audio-input-device-selector"]}>
              {inputMediaDevices.map((device, idx) => {
                return <AudioInputDevice key={idx} device={device} />;
                /*
                const isSelected =
                  (!defaultAudioInputDevice && idx === 0) ||
                  (defaultAudioInputDevice &&
                    defaultAudioInputDevice.deviceId === device.deviceId);
  
                return (
                  <div
                    key={idx}
                    className={classNames(
                      styles["button-wrap"],
                      isSelected ? styles["selected"] : null
                    )}
                  >
                    <ButtonTransparent
                      style={{ width: "100%", height: "100%" }}
                      onClick={() => setDefaultAudioInputDevice(device)}
                    >
                      <div>Kind: {device.kind}</div>
  
                      <div>Label: {device.label}</div>
  
                      {isSelected && (
                        <div className={styles["selected-triangle"]} />
                      )}
                    </ButtonTransparent>
                  </div>
                );
                */
              })}
            </div>
          )}
        </Content>
        {
          // TODO: Re-capture / re-publish existing captured devices when changing settings
          !isFetchingInputMediaDevices && (
            <Footer style={{ backgroundColor: "rgba(0,0,0,.2)" }}>
              <div style={{ display: "inline-block" }}>
                <div className="note" style={{ marginBottom: 8 }}>
                  Input audio quality adjustments
                </div>
                <LabeledSwitch
                  masterLabel="Noise Suppression"
                  isOn={defaultAudioNoiseSuppression}
                  onChange={setDefaultAudioNoiseSuppression}
                />
                <LabeledSwitch
                  masterLabel="Echo Cancellation"
                  isOn={defaultAudioEchoCancellation}
                  onChange={setDefaultAudioEchoCancellation}
                />
                <LabeledSwitch
                  masterLabel="Auto Gain Control"
                  isOn={defaultAudioAutoGainControl}
                  onChange={setDefaultAudioAutoGainControl}
                />
              </div>
            </Footer>
          )
        }
      </Layout>
    </Full>
  );
}

/*
  return (
    <Center canOverflow={true}>
      <Section style={{ maxWidth: 320, display: "inline-block" }}>
        <h1>Audio Capturing</h1>
        <ul>
          <li>TODO: Work on these controls</li>
          <li>
            TODO: Implement default mic audio controller (grid; w/ angled green
            triangle representing default)
          </li>
        </ul>

        <button onClick={() => startMic()}>Capture Mic</button>
        <ul>
          <li>
            Echo Cancellation <Switch style={{ float: "right" }} isOn={true} />
            <p className="note" style={{ fontWeight: "normal" }}>
              Echo cancellation is a feature which attempts to prevent echo
              effects on a two-way audio connection by attempting to reduce or
              eliminate crosstalk between the user's output device and their
              input device. For example, it might apply a filter that negates
              the sound being produced on the speakers from being included in
              the input track generated from the microphone.
            </p>
            <p>
              <TextLink href="https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/echoCancellation" />
            </p>
          </li>
          <li>
            Noise Suppression <Switch style={{ float: "right" }} isOn={true} />
            <p className="note" style={{ fontWeight: "normal" }}>
              Noise suppression automatically filters the audio to remove
              background noise, hum caused by equipment, and the like from the
              sound before delivering it to your code. This feature is typically
              used on microphones, although it is technically possible it could
              be provided by other input sources as well.
            </p>
            <p>
              <TextLink href="https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/noiseSuppression" />
            </p>
          </li>
        </ul>
      </Section>
    </Center>
  );
  */
