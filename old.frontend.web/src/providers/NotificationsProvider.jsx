import React, { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Notification from "@components/Notification";

export const NotificationsContext = React.createContext({});

export default function NotificationsProvider({ children }) {
  const [activeNotificationsStack, setActiveNotificationsStack] = useState([]);

  const showNotification = useCallback(
    ({ image, title, body, onClick, onClose = () => null }) => {
      setActiveNotificationsStack(
        // TODO: Re-implement stack
        (prev) => [
          { image, title, body, onClose, onClick, uuid: uuidv4() },
        ] /*[
        { image, title, body, uuid: uuidv4(), onClose },
        ...prev,
      ]*/
      );
    },
    []
  );

  const handleNotificationClose = useCallback((uuid) => {
    setActiveNotificationsStack((prev) =>
      prev.filter(({ uuid: prevUUID, onClose }) => {
        const isKept = uuid !== prevUUID;

        if (!isKept) {
          // Call the onClose handler passed to showNotification
          onClose();
        }

        return isKept;
      })
    );
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        showNotification,
      }}
    >
      {children}

      {activeNotificationsStack.map((nData) => {
        const handleClick = !nData.onClick
          ? null
          : () => {
              nData.onClick();

              handleNotificationClose(nData.uuid);
            };

        return (
          <Notification
            key={nData.uuid}
            image={nData.image}
            title={nData.title}
            body={nData.body}
            uuid={nData.uuid}
            onClick={handleClick}
            onClose={handleNotificationClose}
          />
        );
      })}
    </NotificationsContext.Provider>
  );
}
