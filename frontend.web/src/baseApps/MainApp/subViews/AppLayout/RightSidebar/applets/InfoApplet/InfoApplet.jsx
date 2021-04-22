import React, { useState } from "react";
import ButtonPanel from "@components/ButtonPanel";
import Layout, { Content, Footer } from "@components/Layout";
import DebugView from "./subViews/DebugView";

import InfoIcon from "@icons/InfoIcon";
import DebugIcon from "@icons/DebugIcon";
/// import RocketIcon from "@icons/RocketIcon";

import useAppLayoutContext from "@hooks/useAppLayoutContext";

export default function InfoApplet() {
  const [contentViewBody, setContentView] = useState(null);
  const { modalView } = useAppLayoutContext();

  // NOTE (jh): Layout key is used to not trigger middle button being active
  // when SetupModal is displayed
  return (
    <Layout key={modalView}>
      <Content>{contentViewBody}</Content>

      <Footer>
        <div>
          <ButtonPanel
            buttons={[
              {
                content: () => (
                  <span>
                    About{" "}
                    <InfoIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                  </span>
                ),
                onClick: () =>
                  setContentView(() => (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        style={{ textAlign: "left" }}
                        dangerouslySetInnerHTML={{
                          __html: window.__aboutHTML,
                        }}
                      />
                    </div>
                  )),
              },
              /*
              {
                content: () => {
                  return (
                    <span>
                      Getting Started{" "}
                      <RocketIcon
                        style={{ marginLeft: 4, fontSize: "1.2em" }}
                      />
                    </span>
                  );
                },
                onClick: () => {
                  setModalView(<SetupModal />);
                },
              },
              */
              /*
            {
              content: () => <span>User Information</span>,
              onClick: () => setContentView(() => <div>User</div>),
            },
            */
              /*
          {
            content: () => <span>Credits</span>,
            onClick: () => setContentView(() => <div>Credits</div>),
          },
          */
              /*
          {
            content: () => <sp\an>Accessibility</span>,
            onClick: () => setContentView(() => <div>Accessibility</div>),
          },
          */
              // TODO: Only show when app is in development
              {
                content: () => (
                  <span>
                    Debug{" "}
                    <DebugIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                  </span>
                ),
                onClick: () => setContentView(() => <DebugView />),
              },
            ]}
          />
        </div>
      </Footer>
    </Layout>
  );
}
