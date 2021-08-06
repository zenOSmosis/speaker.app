import React, { useCallback, useEffect, useState } from "react";
import Center from "@components/Center";
import Layout, { Content, Footer } from "@components/Layout";
import Section from "@components/Section";
import LabeledSwitch from "@components/labeled/LabeledSwitch";
import Full from "@components/Full";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading/StaggeredWaveLoading";

import ReloadIcon from "@icons/ReloadIcon";

import AudioInputDevice from "./AudioInputDevice";

import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";

export default function AudioInputDeviceSelector() {
  const [isFetchingInputMediaDevices, setIsFetchingInputMediaDevices] =
    useState(false);
  const [inputMediaDevices, setInputMediaDevices] = useState([]);
  const [inputMediaDevicesError, setInputMediaDevicesError] = useState(null);
  const [testInputMediaDevice, setTestInputMediaDevice] = useState(null);

  const {
    fetchInputMediaDevices,
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
  } = useInputMediaDevicesContext();

  const handleFetchInputMediaDevices = useCallback(() => {
    setIsFetchingInputMediaDevices(true);

    fetchInputMediaDevices()
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
  }, [fetchInputMediaDevices]);

  // Automatically fetch input media devices
  useEffect(() => {
    handleFetchInputMediaDevices();
  }, [handleFetchInputMediaDevices]);

  // Automatically select default audio input device
  useEffect(() => {
    if (!defaultAudioInputDevice && inputMediaDevices.length) {
      setDefaultAudioInputDevice(inputMediaDevices[0]);
    }
  }, [inputMediaDevices, defaultAudioInputDevice, setDefaultAudioInputDevice]);

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
        <Content
          style={{
            // Don't show scrollbar when fetching
            overflow: !isFetchingInputMediaDevices ? "auto" : "inherit",
          }}
        >
          <Section>
            <div style={{ textAlign: "left" }}>
              <button
                onClick={handleFetchInputMediaDevices}
                style={{ float: "right" }}
              >
                Refresh <ReloadIcon />
              </button>
              <h1>Audio Input Device</h1>
              {/*
              <p>Choose default audio device when starting new calls.</p>
              <p className="note">
                NOTE: Default audio device selection may not persist accurately
                when starting new sessions.
              </p>
            */}
            </div>

            {isFetchingInputMediaDevices ? (
              <Center>
                <div>Fetching audio input devices</div>
                <div>
                  <StaggeredWaveLoading />
                </div>
              </Center>
            ) : (
              <div>
                {inputMediaDevices.map((device, idx) => {
                  const isSelected = Boolean(
                    defaultAudioInputDevice &&
                      defaultAudioInputDevice.deviceId === device.deviceId
                  );

                  const isTesting = Object.is(device, testInputMediaDevice);

                  return (
                    <AudioInputDevice
                      key={idx}
                      device={device}
                      isSelected={isSelected}
                      onSelect={
                        () =>
                          // TODO: Implement toggle of active media device, if clicked again
                          setDefaultAudioInputDevice(device)
                        // setDefaultAudioInputDevice(isSelected ? null : device)
                      }
                      isTesting={isTesting}
                      onTest={() =>
                        // Toggle testing
                        setTestInputMediaDevice(isTesting ? null : device)
                      }
                    />
                  );
                })}
              </div>
            )}
          </Section>
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
