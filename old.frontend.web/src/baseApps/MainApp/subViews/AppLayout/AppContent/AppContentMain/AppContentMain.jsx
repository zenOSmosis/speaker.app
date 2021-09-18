import React from "react";
import Center from "@components/Center";
import ButtonTransparent from "@components/ButtonTransparent";
import Animation from "@components/Animation";
import Full from "@components/Full";
import Cover from "@components/Cover";
import { Video } from "@components/AV";
import Layout, { Header, Content } from "@components/Layout";

import BackingView from "./BackingView";

import CloseIcon from "@icons/CloseIcon";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export default function AppContentMain() {
  const { mainView, setMainView, isSidebarOpen } = useAppLayoutContext();
  const { incomingVideoMediaStreamTracks } = useWebPhantomSessionContext();

  return (
    <Full>
      {!mainView && !incomingVideoMediaStreamTracks.length && <BackingView />}

      <Center>
        {
          // TODO: Replace w/ MultiVideo
          // TODO: Only show last video stream track, by default (mobile can't
          // seem to handle more than one; Only accept one from transcoder?)
        }
        {incomingVideoMediaStreamTracks.map((mediaStreamTrack) => {
          const { id } = mediaStreamTrack;

          return (
            <Cover key={id}>
              <Animation animationName="fadeIn" animationDuration="3s">
                <Video mediaStreamTrack={mediaStreamTrack} />
              </Animation>
            </Cover>
          );
        })}
      </Center>

      {
        // TODO: Extract into separate component
      }
      {mainView && (
        <Cover style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <Layout>
            <Header style={{ textAlign: "right" }}>
              {isSidebarOpen && (
                <ButtonTransparent onClick={() => setMainView(null)}>
                  <CloseIcon />
                </ButtonTransparent>
              )}
            </Header>
            <Content>{mainView}</Content>
          </Layout>
        </Cover>
      )}

      {/*
          <Cover style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
            <div>
              <div>TODO: Show VU Meters for all local participants</div>
              <div>
                TODO: Work in user-level navigation so they can switch main views,
                etc.
              </div>
            </div>
          </Cover>
          */}
    </Full>
  );
}
