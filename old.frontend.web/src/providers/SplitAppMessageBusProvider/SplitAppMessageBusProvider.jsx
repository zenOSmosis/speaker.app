import React, { useEffect, useMemo } from "react";

import SplitAppMessageBus, {
  ROLE_MAIN_APP,
  ROLE_TRANSCODER_APP,
} from "./classes/SplitAppMessageBus";

export const SplitAppMessageBusContext = React.createContext({});

SplitAppMessageBus.propTypes = {
  /**
   * The role of the local app.
   */
  role: (props, propName) => {
    if (
      props[propName] !== ROLE_MAIN_APP &&
      props[propName] !== ROLE_TRANSCODER_APP
    ) {
      throw new Error(
        `role must be either ${ROLE_MAIN_APP} or ${ROLE_TRANSCODER_APP}`
      );
    }
  },
};

// TODO: Document
export default function SplitAppMessageBusProvider({ role, children }) {
  const splitAppMessageBus = useMemo(
    () => new SplitAppMessageBus(role),
    [role]
  );

  useEffect(() => {
    return function unmount() {
      if (splitAppMessageBus) {
        splitAppMessageBus.destroy();
      }
    };
  }, [splitAppMessageBus]);

  return (
    <SplitAppMessageBusContext.Provider value={{ splitAppMessageBus }}>
      {children}
    </SplitAppMessageBusContext.Provider>
  );
}
