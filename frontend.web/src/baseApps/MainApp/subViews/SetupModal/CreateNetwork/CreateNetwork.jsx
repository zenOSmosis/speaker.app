import React, { useEffect, useCallback, useState } from "react";
// import Cover from "@components/Cover";
import Center from "@components/Center";
import Section from "@components/Section";
import ButtonPanel from "@components/ButtonPanel";

// import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useObjectState from "@hooks/useObjectState";

import useClientDeviceContext from "@hooks/useClientDeviceContext";

import PadlockOpenIcon from "@icons/PadlockOpenIcon";
import PadlockCloseIcon from "@icons/PadlockCloseIcon";
import SimpleIcon from "@icons/SimpleIcon";
import AdvancedIcon from "@icons/AdvancedIcon";
import EmbeddedIcon from "@icons/EmbeddedIcon";
import NewTabIcon from "@icons/NewTabIcon";
import ReplaceIcon from "@icons/ReplaceIcon";
import RocketIcon from "@icons/RocketIcon";
// import ServerIcon from "@icons/ServerIcon";

// import meshNetwork from "@assets/network/mesh.svg";
// import mfuNetwork from "@assets/network/mfu.svg";

import useTranscoderSandboxContext, {
  LAUNCH_TARGET_SELF,
  LAUNCH_TARGET_IFRAME,
  LAUNCH_TARGET_NEW_WINDOW,
} from "@baseApps/MainApp/subHooks/useTranscoderSandboxContext";

import { KEY_TRANSCODER_LOCAL_STORAGE_CREDS } from "@local/localStorageKeys";

import useLocalStorage from "@hooks/useLocalStorage";
import useAppRoutesContext from "@hooks/useAppRoutesContext";

import { getCallURL, ROUTE_CALL_URL } from "@baseApps/MainApp/routes";

import styles from "./CreateNetwork.module.css";

//  TODO: Include literature of how a browser tab is utilized as a virtual
// machine in order to host the room

export default function CreateNetwork() {
  const { getItem, setItem } = useLocalStorage();
  const { openRoute } = useAppRoutesContext();

  const { deviceAddress } = useClientDeviceContext();

  const [elInputNetworkName, setElInputNetworkName] = useState(null);

  // Apply auto-focus to network name element
  useEffect(() => {
    if (elInputNetworkName) {
      elInputNetworkName.focus();
    }
  }, [elInputNetworkName]);

  const [
    {
      networkName,
      networkDescription,
      isPublic,
      realmId,
      channelId,
      isShowingAdvanced,
      launchTarget,
    },
    setState,
  ] = useObjectState(
    getItem(KEY_TRANSCODER_LOCAL_STORAGE_CREDS) || {
      // Default form values
      //
      networkName: "",
      networkDescription: "",
      // TODO: Change isPublic default to false after adding in ability to connect to private networks
      isPublic: true,
      realmId: deviceAddress,
      channelId: "",
      isShowingAdvanced: false,
      launchTarget: LAUNCH_TARGET_IFRAME,
    }
  );

  const {
    initTranscoder,
    destroyTranscoder,
    isTranscoderConnected,
  } = useTranscoderSandboxContext();

  const handleSubmit = useCallback(async () => {
    try {
      await initTranscoder({
        networkName,
        networkDescription,
        isPublic,
        realmId,
        channelId,
        launchTarget,
      });

      // Cache form values for next time
      setItem(KEY_TRANSCODER_LOCAL_STORAGE_CREDS, {
        networkName,
        networkDescription,
        isPublic,
        realmId,
        channelId,
        isShowingAdvanced,
        launchTarget,
      });
    } catch (err) {
      // TODO: Handle connect errors

      console.warn("Caught", err);
    }
  }, [
    initTranscoder,
    networkName,
    networkDescription,
    isPublic,
    realmId,
    channelId,
    launchTarget,
    isShowingAdvanced,
    setItem,
  ]);

  // Auto-populate channel id based on network name
  useEffect(() => {
    setState({
      channelId: networkName.toLowerCase().replaceAll(" ", "-"),
    });
  }, [networkName, setState]);

  if (isTranscoderConnected) {
    return (
      <Center canOverflow={true}>
        {
          // TODO: Handle a bit nicer
        }
        <Section style={{ maxWidth: 640, margin: "0px auto" }}>
          <div style={{ fontWeight: "bold" }}>Network Hosting in Progress</div>

          <div style={{ margin: "20px 0px" }}>
            <div className="note">
              Share this URL with others whom you wish to join your network.
            </div>
            <input
              defaultValue={getCallURL({ realmId, channelId })}
              readOnly
              style={{ textAlign: "center" }}
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              onClick={() =>
                openRoute(ROUTE_CALL_URL, {
                  realmId,
                  channelId,
                })
              }
              style={{ backgroundColor: "rgb(52, 127, 232)", marginRight: 8 }}
            >
              Open Network
            </button>

            <button
              onClick={destroyTranscoder}
              style={{ backgroundColor: "red" }}
            >
              Stop
            </button>
          </div>
        </Section>
      </Center>
    );
  }

  return (
    <div className={styles["create-network"]}>
      <form onSubmit={(evt) => evt.preventDefault()}>
        <Section>
          <ButtonPanel
            buttons={[
              {
                content: () => (
                  <span>
                    Simple{" "}
                    <SimpleIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                  </span>
                ),
                onClick: () =>
                  setState({
                    isShowingAdvanced: false,
                  }),
                isSelected: !isShowingAdvanced,
              },
              {
                content: () => (
                  <span>
                    Advanced{" "}
                    <AdvancedIcon
                      style={{ marginLeft: 4, fontSize: "1.2em" }}
                    />
                  </span>
                ),
                onClick: () => setState({ isShowingAdvanced: true }),
                isSelected: isShowingAdvanced,
              },
            ]}
          />
        </Section>

        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "inline-block",
            textAlign: "left",
          }}
        >
          <div className="note" style={{ textAlign: "center", margin: 20 }}>
            <p>
              All traffic in / out of this network will be routed through your
              device.
            </p>
            <p>
              Networks created here are temporary and only active while this
              device is online.
            </p>
          </div>

          <Section>
            {
              // TODO:: Use htmlFor attributes on the labels
              // TODO: Add error handling / messages
            }
            <label>Network Name</label>
            <input
              ref={setElInputNetworkName}
              type="text"
              value={networkName}
              onChange={(evt) =>
                setState({
                  networkName: evt.target.value,
                })
              }
            />
          </Section>

          <Section>
            <div style={{ textAlign: "center" }}>
              <div className="note">Select network type:</div>
              <ButtonPanel
                buttons={[
                  {
                    content: () => (
                      <span>
                        Public <PadlockOpenIcon style={{ fontSize: "1.2em" }} />
                      </span>
                    ),
                    onClick: () => setState({ isPublic: true }),
                    isSelected: isPublic,
                  },
                  {
                    content: () => (
                      <span>
                        Private{" "}
                        <PadlockCloseIcon style={{ fontSize: "1.2em" }} />
                      </span>
                    ),
                    onClick: () => setState({ isPublic: false }),
                    isSelected: !isPublic,
                  },
                ]}
              />
            </div>
            <div className="note" style={{ marginTop: 10 }}>
              Public networks can be seen by everyone and are displayed within
              the "Networks" tab.
            </div>
          </Section>

          <Section>
            <label>Description (optional)</label>
            <textarea
              value={networkDescription}
              onChange={(evt) =>
                setState({
                  networkDescription: evt.target.value,
                })
              }
              placeholder="The topic or some other interesting detail to let others know what this network is about"
            ></textarea>
          </Section>

          {isShowingAdvanced && (
            <>
              <Section style={{ overflow: "auto" }}>
                <h2>Routing</h2>
                <div style={{ width: "48%", float: "left" }}>
                  <label>Realm</label>
                  <input
                    type="text"
                    value={realmId}
                    onChange={(evt) =>
                      setState({
                        realmId: evt.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    width: "48%",
                    float: "right",
                  }}
                >
                  <label>Channel</label>
                  <input
                    type="text"
                    value={channelId}
                    onChange={(evt) =>
                      setState({
                        channelId: evt.target.value,
                      })
                    }
                  />
                </div>
              </Section>

              {
                // TODO: Provide documentation describing what each of these option mean
              }
              <Section>
                <h2>Launch Target</h2>
                <div style={{ textAlign: "center" }}>
                  <button
                    style={{ width: 100 }}
                    onClick={() =>
                      setState({
                        launchTarget: LAUNCH_TARGET_IFRAME,
                      })
                    }
                    className={
                      launchTarget === LAUNCH_TARGET_IFRAME ? "active" : null
                    }
                  >
                    Embed
                    <div>
                      <EmbeddedIcon style={{ fontSize: 40 }} />
                    </div>
                  </button>

                  <button
                    style={{ width: 100 }}
                    onClick={() =>
                      setState({
                        launchTarget: LAUNCH_TARGET_NEW_WINDOW,
                      })
                    }
                    className={
                      launchTarget === LAUNCH_TARGET_NEW_WINDOW
                        ? "active"
                        : null
                    }
                  >
                    New Tab
                    <div>
                      <NewTabIcon style={{ fontSize: 40 }} />
                    </div>
                  </button>

                  <button
                    style={{ width: 100 }}
                    onClick={() =>
                      setState({
                        launchTarget: LAUNCH_TARGET_SELF,
                      })
                    }
                    className={
                      launchTarget === LAUNCH_TARGET_SELF ? "active" : null
                    }
                  >
                    Replace
                    <div>
                      <ReplaceIcon style={{ fontSize: 40 }} />
                    </div>
                  </button>
                </div>
              </Section>
            </>
          )}

          <Section style={{ textAlign: "center" }}>
            {
              // TODO: After launching, show share URL / QR code
            }

            <button
              disabled={!networkName.length}
              style={{ backgroundColor: "green" }}
              onClick={handleSubmit}
            >
              Launch{" "}
              <RocketIcon
                style={{ fontSize: "1.8rem", verticalAlign: "middle" }}
              />
            </button>
          </Section>
        </div>
      </form>
    </div>
  );
}
