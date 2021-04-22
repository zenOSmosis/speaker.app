import React, { useCallback, useEffect, useState } from "react";
import Layout, { Header, Content, Footer } from "@components/Layout";
import Section from "@components/Section";
import Center from "@components/Center";
import Cover from "@components/Cover";
import ButtonTransparent from "@components/ButtonTransparent";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading";

import { SOCKET_API_ROUTE_MEDIA_SEARCH } from "@shared/socketAPIRoutes";
import { fetch } from "@shared/SocketAPIClient";

import unsplashLogo from "@assets/unsplash_wordmark_logo.svg";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useObjectState from "@hooks/useObjectState";

import dayjs from "dayjs";

// TODO: Remove
import temporaryDefaultState from "./temporaryDefaultState";

// Enable the view to show its previous state after closing
let _cachedState = temporaryDefaultState;

// TODO: Add double-click to select image

export default function BackgroundSelector() {
  const [state, setState] = useObjectState({
    ..._cachedState,

    // Intentionally don't use the previously selected image as it will trigger
    // the main view and winds up not being able to open menu on smaller
    // viewports
    backgroundImage: null,
  });

  _cachedState = state;

  const { backgroundImage, searchQuery = "", results = [] } = state || {};

  useMainView({ backgroundImage });

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (searchQuery) => {
      // FIXME: Another approach could be canceling of current query
      if (isSearching) {
        return;
      }

      if (searchQuery.length) {
        // TODO: Extract
        setIsSearching(true);

        fetch(SOCKET_API_ROUTE_MEDIA_SEARCH, {
          query: searchQuery,
          queryEngine: "unsplash",
        })
          .then((resp) => {
            // TODO: Remove
            console.log(resp);

            setState({
              results: resp.results,

              // Reset search query
              searchQuery: "",
            });
          })
          // TODO: Handle error
          .finally(() => {
            setIsSearching(false);
          });
      }
    },
    [isSearching, setState]
  );

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();

      handleSearch(searchQuery);
    },
    [handleSearch, searchQuery]
  );

  return (
    <Layout>
      <Header>
        <Section>
          <div className="note">
            Background images are shared with all participants.
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search"
              onChange={(evt) =>
                setState({
                  searchQuery: evt.target.value,
                })
              }
              value={searchQuery}
            />
          </form>
        </Section>
      </Header>
      <Content>
        <Center canOverflow={true}>
          {results.map((result) => {
            const isSelected =
              backgroundImage && backgroundImage.id === result.id;

            return (
              <ButtonTransparent
                key={result.id}
                style={{
                  width: 158,
                  maxWidth: 158,
                  display: "inline-block",
                  margin: 2,
                }}
                onClick={() =>
                  setState({
                    backgroundImage: result,
                  })
                }
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    border: `2px ${isSelected ? "red" : "black"} solid`,
                  }}
                >
                  <img
                    style={{ width: "100%" }}
                    src={result.urls.regular}
                    alt={result.alt_description}
                    title={result.alt_description}
                  />
                </div>
              </ButtonTransparent>
            );
          })}

          {/*
          results.length === 0 && (
            <Center canOverflow={true}>[TODO: Show current info here]</Center>
          )
          */}
        </Center>

        {isSearching && (
          <Cover style={{ backgroundColor: "rgba(0,0,0,.7)" }}>
            <Center>
              <div>
                <div style={{ fontSize: "1.8rem" }}>Loading</div>
                <div>
                  <StaggeredWaveLoading />
                </div>
              </div>
            </Center>
          </Cover>
        )}
      </Content>
      <Footer style={{ backgroundColor: "rgba(0,0,0,.2)" }}>
        <ButtonTransparent
          onClick={() => window.open("https://unsplash.com", "_blank")}
        >
          <p className="note" style={{ fontWeight: "normal" }}>
            Image searching provided by:
          </p>

          <img src={unsplashLogo} alt="Unsplash" style={{ width: "50%" }} />
        </ButtonTransparent>
      </Footer>
    </Layout>
  );
}

function useMainView({ backgroundImage }) {
  const { setMainView } = useAppLayoutContext();

  const { writableSyncObject } = useWebPhantomSessionContext();

  useEffect(() => {
    if (backgroundImage) {
      setMainView(
        <Layout>
          <Content>
            <Center>
              <img
                src={backgroundImage.urls.regular}
                alt={backgroundImage.alt_description}
                title={backgroundImage.alt_description}
                style={{ width: "100%" }}
              />
            </Center>
          </Content>
          <Footer>
            {
              // TODO: Add as overlay for content?
              // TODO: If sidebar isn't showing, show Unsplash logo
            }

            <button
              // TODO: Only set URL
              onClick={() => {
                writableSyncObject &&
                  writableSyncObject.setState({ backgroundImage });

                setMainView(null);
              }}
              style={{ float: "right", backgroundColor: "rgb(52, 127, 232)" }}
            >
              Use as Background
            </button>

            <div style={{ fontSize: ".9rem", textAlign: "left" }}>
              <div>Created: {dayjs(backgroundImage.created_at).fromNow()}</div>
              <div>
                Description:{" "}
                {backgroundImage.description ||
                  backgroundImage.alt_description ||
                  "N/A"}
              </div>
              <div>
                Original:{" "}
                <a
                  href={backgroundImage.links.html}
                  target="_blank"
                  rel="noreferrer"
                >
                  {backgroundImage.links.html}
                </a>
              </div>
            </div>
          </Footer>
        </Layout>
      );
    }
  }, [backgroundImage, setMainView, writableSyncObject]);
}
