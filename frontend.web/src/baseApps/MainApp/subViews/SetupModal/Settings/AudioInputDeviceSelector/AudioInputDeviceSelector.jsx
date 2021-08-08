import React, { useCallback, useEffect, useState } from "react";
import Center from "@components/Center";
import Layout, { Content, Footer } from "@components/Layout";
import Section from "@components/Section";
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
    fetchAudioInputDevices,

    // TODO: Clean up unused props
    /*
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
    */
  } = useInputMediaDevicesContext();

  const handleFetchInputMediaDevices = useCallback(() => {
    setIsFetchingInputMediaDevices(true);

    fetchAudioInputDevices()
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
  }, [fetchAudioInputDevices]);

  // Automatically fetch input media devices
  useEffect(() => {
    handleFetchInputMediaDevices();
  }, [handleFetchInputMediaDevices]);

  // TODO: Reimplement
  // Automatically select default audio input device
  /*
  useEffect(() => {
    if (!defaultAudioInputDevice && inputMediaDevices.length) {
      setDefaultAudioInputDevice(inputMediaDevices[0]);
    }
  }, [inputMediaDevices, defaultAudioInputDevice, setDefaultAudioInputDevice]);
  */

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
                disabled={isFetchingInputMediaDevices}
              >
                Refresh <ReloadIcon />
              </button>
              <h1>Audio Input Devices</h1>
              <div className="note" style={{ marginBottom: 8 }}>
                Multiple devices can be streamed concurrently.
              </div>
              {/*
              <p>Choose default audio device when starting new calls.</p>
              <p className="note">
                NOTE: Default audio device selection may not persist accurately
                when starting new sessions.
              </p>
            */}
            </div>

            {isFetchingInputMediaDevices && !inputMediaDevices.length ? (
              <Center>
                <div>Fetching audio input devices</div>
                <div>
                  <StaggeredWaveLoading />
                </div>
              </Center>
            ) : (
              <div>
                {inputMediaDevices.map((device, idx) => {
                  // TODO: Rework this
                  const isSelected = false;

                  const isTesting = Object.is(device, testInputMediaDevice);

                  return (
                    <AudioInputDevice
                      key={idx}
                      device={device}
                      isSelected={isSelected}
                      onSelect={
                        // TODO: Rework
                        () => null
                        // TODO: Implement toggle of active media device, if clicked again
                        // setDefaultAudioInputDevice(device)
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
        <Footer style={{ backgroundColor: "rgba(0,0,0,.2)" }}>
          {
            // TODO: Use caution sign and only show if this is really true
          }
          <div>
            {
              // TODO: Change to "no input device available" if no audio devices are present
            }
            <div>No audio input device selected.</div>
            <div>
              <span className="note">
                Other participants will not be able to hear you.
              </span>
            </div>
          </div>
        </Footer>
      </Layout>
    </Full>
  );
}
