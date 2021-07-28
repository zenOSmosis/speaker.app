import React, { useEffect, useRef } from "react";
import { generatePath, matchPath } from "react-router";
import urlParse from "url-parse";

import useSocketContext from "@hooks/useSocketContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

import SetupModal, {
  PROFILE_TAB,
  NETWORK_TAB,
  PRIVATE_NETWORK_TAB,
  CREATE_NETWORK_TAB,
  SETTINGS_TAB,
  ABOUT_TAB,
} from "./subViews/SetupModal";

import getIsDevelopmentMode from "@utils/getIsDevelopmentMode";

export const ROUTE_SETUP_PROFILE = {
  path: "/setup/profile",
  modalView: () => <SetupModal selectedTab={PROFILE_TAB} />,
};

export const ROUTE_SETUP_NETWORKS = {
  path: "/setup/networks",
  modalView: () => <SetupModal selectedTab={NETWORK_TAB} />,
};

export const ROUTE_SETUP_PRIVATE_NETWORKS = {
  path: "/setup/networks/private",
  modalView: () => <SetupModal selectedTab={PRIVATE_NETWORK_TAB} />,
};

export const ROUTE_SETUP_CREATE_NETWORK = {
  path: "/setup/network/create",
  modalView: () => <SetupModal selectedTab={CREATE_NETWORK_TAB} />,
};

export const ROUTE_SETUP_CONFIGURE = {
  path: "/setup/configure",
  modalView: () => <SetupModal selectedTab={SETTINGS_TAB} />,
};

export const ROUTE_ABOUT = {
  path: "/about",
  modalView: () => <SetupModal selectedTab={ABOUT_TAB} />,
};

export const ROUTE_CALL_URL = {
  path: "/network/:realmId/:channelId",
  useController: ({ realmId, channelId }) => {
    const { isConnected: isSocketIoConnected } = useSocketContext();

    const { setRealmId, setChannelId, connect, isConnected, isHostOnline } =
      useWebPhantomSessionContext();

    // The realm and channel must be pre-set in order for the isHostOnline
    // check to function
    //
    // Warnings will appear if these are not wrapped in a setTimeout
    setTimeout(() => {
      setRealmId(realmId);
      setChannelId(channelId);
    });

    // If connect is passed to the useEffect as a dep, it will go into an
    // infinite loop, even though the internal handlers are memoized
    const refConnect = useRef(connect);
    refConnect.current = connect;

    useEffect(() => {
      if (!isConnected && isSocketIoConnected && isHostOnline) {
        const connect = refConnect.current;

        // TODO: Determine if the host is online before trying to connect
        // If the host is not online, relay the message to the user

        connect({ realmId, channelId });
      }
    }, [isConnected, realmId, channelId, isSocketIoConnected, isHostOnline]);
  },
};

/**
 * Retrieves the call URL for the given options.
 *
 * An absolute URL, it is intended for sharing across the internet.
 *
 * @param {Object} options
 * @return {string}
 */
export const getCallURL = ({ realmId, channelId }) => {
  if (!realmId || !channelId) {
    return;
  }

  const pathname = generatePath(ROUTE_CALL_URL.path, {
    realmId,
    channelId,
  });

  const { protocol, slashes, host, hostname } = urlParse(window.location.href);

  // Host name without port number
  let dynamicHost = hostname;

  if (getIsDevelopmentMode()) {
    // Host name with port number
    dynamicHost = host;
  }

  return `${protocol}${slashes && "//"}${dynamicHost}${pathname}`;
};

/**
 * @param {string} callURL Absolute URL (i.e.
 * "https://speaker.app/network/realm/channel").
 * @return {Object} An object w/ realmId and channelId properties.
 */
export const parseCallURL = callURL => {
  const { pathname } = urlParse(callURL);

  const matched = matchPath(pathname, ROUTE_CALL_URL.path);

  if (matched) {
    return matched.params;
  }
};

/**
 * @return {boolean} Returns true if the current URL is an in-call URL.
 */
/*
export const getIsInCallURL = () => {
  const matchedPath = matchPath(window.location.pathname, ROUTE_CALL_URL.path);

  return Boolean(matchedPath);
};
*/

export const ROUTE_CALL_DISCONNECT = {
  path: "/network/disconnect",
  useController: (nil, openRoute) => {
    const { disconnect } = useWebPhantomSessionContext();

    disconnect();

    openRoute(ROUTE_SETUP_NETWORKS);
  },
};

export const ROUTE_404 = {
  path: "/404",
  useController: (nil, openRoute) => {
    // TODO: Should we ever show a 404 page?

    // Redirect to networks
    openRoute(ROUTE_SETUP_NETWORKS);
  },
};

/*
export const ROUTE_MENU_ITEM = {
  path: "/n/:networkAddress/m/:menuItemName",
};
*/

export const ROUTE_HOME = {
  path: "/",
  redirectRoute: ROUTE_SETUP_NETWORKS,
};
