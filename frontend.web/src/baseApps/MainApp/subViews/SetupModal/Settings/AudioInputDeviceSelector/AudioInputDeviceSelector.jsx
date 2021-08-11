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

  const [selectedInputMediaDevices, _setSelectedInputMediaDevices] = useState(
    []
  );
  const [testInputMediaDevices, _setTestInputMediaDevices] = useState([]);

  // TODO: Document
  const _addSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setSelectedInputMediaDevices(prev => {
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  // TODO: Document
  const _removeSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setSelectedInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  // TODO: Document
  const _addTestInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestInputMediaDevices(prev => {
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  // TODO: Document
  const _removeTestInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  const {
    fetchAudioInputDevices,
    captureSpecificMediaDevice,
    uncaptureSpecificMediaDevice,

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
              <h1>Audio Input Devices</h1>
              <div className="note" style={{ marginBottom: 8 }}>
                Multiple devices can be streamed concurrently. If plugging in a
                new audio input device and it does not display in this list,
                press{" "}
                <button
                  onClick={handleFetchInputMediaDevices}
                  disabled={isFetchingInputMediaDevices}
                >
                  Refresh <ReloadIcon />
                </button>
                .
              </div>
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
                  const isSelected = selectedInputMediaDevices.includes(device);

                  const isTesting = testInputMediaDevices.includes(device);

                  return (
                    <AudioInputDevice
                      key={idx}
                      device={device}
                      isSelected={isSelected}
                      onToggleSelect={() =>
                        // TODO: Use callback function instead
                        !isSelected
                          ? _addSelectedInputMediaDevice(device)
                          : _removeSelectedInputMediaDevice(device)
                      }
                      isTesting={isTesting}
                      onToggleTest={() =>
                        // TODO: Use callback function instead
                        !isTesting
                          ? _addTestInputMediaDevice(device)
                          : _removeTestInputMediaDevice(device)
                      }

                      // TODO: Implement
                      // isAudioNoiseSuppression={isAudioNoiseSuppression}
                      // setIsAudioNoiseSuppression={setIsAudioNoiseSuppression}
                      // isAudioEchoCancellation={isAudioEchoCancellation}
                      // setIsAudioEchoCancellation={setIsAudioEchoCancellation}
                      // isAudioAutoGainControl={isAudioAutoGainControl}
                      // setIsAudioAutoGainControl={setIsAudioAutoGainControl}
                    />
                  );
                })}
              </div>
            )}
          </Section>
        </Content>
        <Footer style={{ backgroundColor: "rgba(0,0,0,.2)" }}>
          {!selectedInputMediaDevices.length && (
            <div>
              {
                // TODO: Change to "no input device available" if no audio devices are present
              }
              <div style={{ fontWeight: "bold", color: "yellow" }}>
                {
                  // TODO: Use caution sign as well
                }
                No audio input device selected for broadcasting.
              </div>
              <div>
                <span className="note">
                  Other participants will not be able to hear you.
                </span>
              </div>
            </div>
          )}
        </Footer>
      </Layout>
    </Full>
  );
}
