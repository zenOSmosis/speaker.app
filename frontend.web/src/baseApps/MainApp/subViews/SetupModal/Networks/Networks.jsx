import React, { useCallback, useEffect } from "react";
import Layout, { Header, Content, Footer } from "@components/Layout";
import Cover from "@components/Cover";
import Center from "@components/Center";
import Background from "@components/Background";

import NetworkTypeButtonPanelSection from "./NetworkTypeButtonPanelSection";

import CallIcon from "@icons/CallIcon";
import HangupIcon from "@icons/HangupIcon";
import PadlockOpenIcon from "@icons/PadlockOpenIcon";
import PadlockCloseIcon from "@icons/PadlockCloseIcon";
import SpeakerIcon from "@icons/SpeakerIcon";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
import useNetworksQuery from "@hooks/useNetworksQuery";
import useSocketContext from "@hooks/useSocketContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useKeyboardEvents from "@hooks/useKeyboardEvents";
import useForceUpdate from "@hooks/useForceUpdate";

import {
  ROUTE_HOME,
  ROUTE_CALL_URL,
  ROUTE_SETUP_PRIVATE_NETWORKS,
  ROUTE_SETUP_CREATE_NETWORK,
} from "@baseApps/MainApp/routes";

import dayjs from "dayjs";

import styles from "./Networks.module.css";

export default function Networks() {
  const { isConnected: isSocketConnected } = useSocketContext();
  const { networks } = useNetworksQuery();
  const {
    disconnect,
    realmId,
    channelId,
    isConnected,
  } = useWebPhantomSessionContext();

  const { openRoute } = useAppRoutesContext();
  const closeModal = useCallback(() => openRoute(ROUTE_HOME), [openRoute]);

  // Update "fromNow" time every minute
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const updateInterval = setInterval(forceUpdate, 1000 * 60);

    return function unmount() {
      clearInterval(updateInterval);
    };
  }, [forceUpdate]);

  // Allow escape key to close out Modal if connected and Network tab is
  // selected
  useKeyboardEvents({
    onKeyDown: (keyCode) => isConnected && keyCode === 27 && closeModal(),
  });

  return (
    <React.Fragment>
      <Cover>
        <h1 style={{ fontSize: "14vw", margin: 0, padding: 0, opacity: 0.1 }}>
          Networks
        </h1>
      </Cover>
      <Cover>
        <Layout>
          <Header>
            <NetworkTypeButtonPanelSection />
          </Header>
          <Content>
            {!networks.length ? (
              <Center style={{ fontWeight: "bold" }}>
                <div>
                  <div>
                    {isSocketConnected
                      ? "There are currently no public networks to connect to."
                      : "Awaiting socket connection."}
                  </div>

                  {
                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => openRoute(ROUTE_SETUP_PRIVATE_NETWORKS)}
                        style={{
                          backgroundColor: "rgb(52, 127, 232)",
                          color: "#fff",
                        }}
                      >
                        Open Private Network
                      </button>{" "}
                      |{" "}
                      <button
                        onClick={() => openRoute(ROUTE_SETUP_CREATE_NETWORK)}
                        style={{
                          backgroundColor: "rgb(52, 127, 232)",
                          color: "#fff",
                        }}
                      >
                        + Create Network
                      </button>
                    </div>
                  }
                </div>
              </Center>
            ) : (
              <Center canOverflow={true}>
                {/*
          <Section>
            <button
              onClick={() => alert("TODO: Implement private network connection")}
            >
              Connect to a private Network
            </button>
            </Section>
            */}

                <div>
                  {networks.map((network) => {
                    // TODO: Highlight active network, if currently connected to it
                    const isCurrentNetwork =
                      isConnected &&
                      realmId === network.realmId &&
                      channelId === network.channelId;

                    const PadlockIcon = network.isPublic
                      ? PadlockOpenIcon
                      : PadlockCloseIcon;
                    const padlockTitle = network.isPublic
                      ? "Public Network"
                      : "Private Network";

                    const strPubPrivNetwork = `${
                      network.isPublic ? "Public" : "Private"
                    } Network`;

                    return (
                      <button
                        key={network._id}
                        className={styles["network"]}
                        onClick={() =>
                          !isConnected
                            ? /*connect({
                            // TODO: Navigate to network URL
                            realmId: network.realmId,
                            channelId: network.channelId,
                          }).then(() => closeModal())
                          */
                              openRoute(ROUTE_CALL_URL, {
                                realmId: network.realmId,
                                channelId: network.channelId,
                              })
                            : disconnect()
                        }
                        title={
                          `[${strPubPrivNetwork}]\n\n` +
                          network.name +
                          (network.description && network.description.length
                            ? `: ${network.description}`
                            : "") +
                          ``
                        }
                      >
                        <Background
                          src={
                            network &&
                            network.backgroundImage &&
                            network.backgroundImage.urls &&
                            network.backgroundImage.urls.regular
                          }
                          style={{
                            backgroundColor: "rgba(0,0,0,.5)",
                            padding: 2,
                          }}
                        >
                          <Layout>
                            <Header>
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                }}
                              >
                                <SpeakerIcon style={{ fontSize: "1.8em" }} />
                              </div>
                              <div
                                style={{
                                  float: "right",
                                  fontWeight: "normal",
                                  fontSize: ".8rem",
                                }}
                              >
                                <div
                                  style={{
                                    display: "inline-block",
                                    textAlign: "right",
                                    marginRight: 4,
                                  }}
                                >
                                  <div>
                                    Created:{" "}
                                    {dayjs(network.createdAt).fromNow()}
                                  </div>
                                  <div>
                                    <span>
                                      Participants:{" "}
                                      {network.connectedParticipants}
                                    </span>{" "}
                                    <span style={{ fontWeight: "bold" }}>
                                      {network.isPublic ? "Public" : "Private"}{" "}
                                      Network
                                    </span>
                                  </div>
                                </div>
                                <PadlockIcon
                                  title={padlockTitle}
                                  style={{ fontSize: "1.8rem", float: "right" }}
                                />
                              </div>
                              <h2
                                className={styles["title"]}
                                /*
                                style={{
                                  padding: 0,
                                  margin: "0px 0px 4px 0px",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                                */
                              >
                                {network.name}
                              </h2>
                            </Header>
                            <Content>
                              <div className={styles["description"]}>
                                {network.description}
                              </div>

                              <div style={{ fontSize: ".8rem" }}>
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    width: "100%",
                                    textAlign: "left",
                                    color: "rgba(255,255,255,.5)",
                                  }}
                                >
                                  <div
                                    style={{
                                      clear: "both",
                                      // maxWidth: "100%",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    Realm: {network.realmId}
                                  </div>

                                  <div
                                    style={{
                                      // maxWidth: "100%",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    Channel: {network.channelId}
                                  </div>
                                </div>
                              </div>
                            </Content>
                            <Footer>
                              <div
                                style={{
                                  backgroundColor: "rgba(0,0,0,.4)",
                                  padding: 4,
                                  fontWeight: "bold",
                                  clear: "both",
                                }}
                              >
                                {!isCurrentNetwork ? (
                                  <>
                                    <CallIcon style={{ color: "green" }} />{" "}
                                    Connect
                                  </>
                                ) : (
                                  <>
                                    <HangupIcon
                                      style={{
                                        color: "red",
                                        fontSize: "1.4rem",
                                        verticalAlign: "middle",
                                      }}
                                    />{" "}
                                    Disconnect
                                  </>
                                )}
                              </div>
                            </Footer>
                          </Layout>
                        </Background>
                      </button>
                    );
                  })}
                </div>
              </Center>
            )}
          </Content>

          {
            // TODO: If hosting a network, show indication of it
            /**
            {networks.length > 0 && (
              <Footer>
                <div
                  style={{
                    padding: 8,
                    backgroundColor: "rgba(0,0,0,.5)",
                    // fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#fffa7c",
                  }}
                >
                  Not finding what you're looking for?{" "}
                  <button
                    style={{
                      backgroundColor: "rgb(52, 127, 232)",
                      color: "#fff",
                    }}
                    onClick={() => openRoute(ROUTE_SETUP_PRIVATE_NETWORKS)}
                  >
                    Join a Private Network
                  </button>
                  {" or "}
                  <button
                    style={{
                      backgroundColor: "rgb(52, 127, 232)",
                      color: "#fff",
                    }}
                    onClick={() => openRoute(ROUTE_SETUP_CREATE_NETWORK)}
                  >
                    Create a Network
                  </button>
                </div>
              </Footer>
            )}
             */
          }
        </Layout>
      </Cover>
    </React.Fragment>
  );
}
