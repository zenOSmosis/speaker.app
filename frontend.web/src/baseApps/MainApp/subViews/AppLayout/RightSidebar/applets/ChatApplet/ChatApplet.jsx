import React, { useCallback, useEffect, useState } from "react";
import Center from "@components/Center";
import Layout, { Content, Footer, Row, Column } from "@components/Layout";
import Avatar from "@components/Avatar";

import useKeyboardEvents from "@hooks/useKeyboardEvents";
import useChatMessagesContext from "@hooks/useChatMessagesContext";
import useAppLayoutContext from "@hooks/useAppLayoutContext";

import anchorme from "anchorme";

export default function ChatApplet() {
  const { chatMessages, sendMessage } = useChatMessagesContext();

  const { openProfile } = useAppLayoutContext();

  const [typerEl, setTyperEl] = useState(null);

  const [scrollerEl, setScrollerEl] = useState(null);

  // Force scroller to bottom when there are new chatMessages
  useEffect(() => {
    if (scrollerEl && chatMessages) {
      scrollerEl.scrollTop = scrollerEl.scrollHeight;
    }
  }, [scrollerEl, chatMessages]);

  const resetInput = useCallback(() => (typerEl.value = ""), [typerEl]);

  const handleMessageSend = useCallback(async () => {
    const messageText = typerEl.value;

    if (messageText.length) {
      sendMessage(messageText);
    }

    // TODO: Ensure message gets delivered?

    resetInput();

    // Hide mobile keyboard
    // typerEl.blur();
  }, [typerEl, sendMessage, resetInput]);

  useKeyboardEvents({
    onKeyDown: (keyCode) => {
      switch (keyCode) {
        case 27: // Escape
          resetInput();
          break;

        case 13: // Enter
          handleMessageSend();
          break;

        default:
          break;
      }
    },
  });

  return (
    <Layout>
      <Content>
        {chatMessages.length > 0 ? (
          <div
            ref={setScrollerEl}
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              textAlign: "left",

              // Bottom-up styling
              display: "flex",
              flexDirection: "column-reverse",
            }}
          >
            {[
              ...(() => {
                const reversedMessages = [...chatMessages];

                reversedMessages.reverse();

                return reversedMessages;
              })(),
            ].map((message) => (
              <div
                key={message.id}
                style={{
                  padding: 4,
                  border: "1px rgba(255,255,255,.1) solid",
                  margin: 4,
                }}
              >
                {message.sender && (
                  <Avatar
                    src={message.sender.avatarURL}
                    name={message.sender.name}
                    description={message.sender.description}
                    onClick={() => openProfile(message.sender)}
                    style={{ float: "left", marginRight: 8 }}
                    size={50}
                  />
                )}

                <div style={{ fontWeight: "bold", marginBottom: 2 }}>
                  {(message && message.sender && message.sender.name) || (
                    <span className="note">[Sender Unknown]</span>
                  )}
                </div>
                <div>
                  <Linkify string={message.body} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Center>
            <div style={{ fontWeight: "bold" }}>
              Be the first to write a message here.
            </div>
          </Center>
        )}
      </Content>
      <Footer>
        <Row>
          <Column>
            <input
              ref={setTyperEl}
              type="text"
              placeholder="Write whatever..."
              style={{ width: "100%", margin: 0 }}
              // TODO: Move this elsewhere and bring in as dynamic value
              maxLength={512}
            />
          </Column>
          <Column style={{ maxWidth: 50 }}>
            <button
              onClick={handleMessageSend}
              style={{
                whiteSpace: "nowrap",

                margin: 0,
                height: "100%",
              }}
            >
              Send
            </button>
          </Column>
        </Row>
      </Footer>
    </Layout>
  );
}

function Linkify({ string, ...rest }) {
  const [linkified, _setLinkified] = useState(string);

  useEffect(() => {
    // @see http://alexcorvi.github.io/anchorme.js/#options
    const linkified = anchorme({
      input: string,

      options: {
        attributes: {
          target: "_blank",
          // class: "detected",
        },
      },
    });

    _setLinkified(linkified);
  }, [string]);

  return <div dangerouslySetInnerHTML={{ __html: linkified }} {...rest} />;
}
