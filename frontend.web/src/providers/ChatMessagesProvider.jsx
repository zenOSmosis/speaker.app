import React, { useCallback, useEffect, useRef, useState } from "react";
import { EVT_UPDATED } from "sync-object";
import UIMessage from "@local/UIMessage";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useSocketContext from "@hooks/useSocketContext";

export const ChatMessagesContext = React.createContext();

export default function ChatMessagesProvider({ children }) {
  const {
    readOnlySyncObject,
    writableSyncObject,
    getParticipantWithDeviceAddress,
    isConnected,
  } = useWebPhantomSessionContext();

  const { deviceAddress } = useSocketContext();

  // TODO: Obtain from read-only state
  const [chatMessages, _setChatMessages] = useState([]);

  const [addedMessages, _setAddedMessages] = useState(0);

  // Handle detection of new messages from other users
  const refLastMessages = useRef([]);
  useEffect(() => {
    const lastMessages = refLastMessages.current;

    const addedMessages = [];

    // Handle added messages
    const diffCount = chatMessages.length - lastMessages.length;
    if (diffCount > 0) {
      for (
        let i = chatMessages.length - 1;
        i >= chatMessages.length - diffCount;
        i--
      ) {
        const chatMessage = chatMessages[i] || {};

        if (chatMessage.senderAddress !== deviceAddress) {
          addedMessages.push(chatMessage);
        }
      }
    }

    // Make most recent the beginning of the array
    addedMessages.reverse();

    _setAddedMessages(addedMessages);

    // Finally, set the last messages as current messages
    refLastMessages.current = chatMessages;
  }, [deviceAddress, chatMessages]);

  useEffect(() => {
    if (isConnected && readOnlySyncObject) {
      const _handleUpdate = (updatedState = {}) => {
        if (updatedState.chatMessages) {
          const fullState = readOnlySyncObject.getState();

          const chatMessages = Object.values(fullState.chatMessages).map(
            message => ({
              ...message,
              ...{
                sender: getParticipantWithDeviceAddress(message.senderAddress),
              },
            })
          );

          // IMPORTANT: Set UI chat messages to full state instead of updated
          // state, or else it will only render the updated messages
          _setChatMessages(chatMessages);
        }
      };

      _handleUpdate(readOnlySyncObject.getState());

      readOnlySyncObject.on(EVT_UPDATED, _handleUpdate);

      return function unmount() {
        readOnlySyncObject.off(EVT_UPDATED, _handleUpdate);
      };
    } else {
      // Clear chat messages on disconnect
      _setChatMessages([]);
    }
  }, [isConnected, readOnlySyncObject, getParticipantWithDeviceAddress]);

  const sendMessage = useCallback(
    body => {
      if (!writableSyncObject) {
        throw new Error(
          "writableSyncObject is not available. Maybe you are not connected to a network."
        );
      }

      const uiMessage = new UIMessage({
        senderAddress: deviceAddress,
        body,
      });

      writableSyncObject.setState({
        chatMessages: {
          [uiMessage.getId()]: uiMessage.getState(),
        },
      });
    },
    [writableSyncObject, deviceAddress]
  );

  return (
    <ChatMessagesContext.Provider
      value={{ chatMessages, addedMessages, sendMessage }}
    >
      {children}
    </ChatMessagesContext.Provider>
  );
}
