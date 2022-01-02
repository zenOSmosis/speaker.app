// TODO: Move routes into "routes" subdirectory
// TODO: Bonus credits, make utility which shows list of registered routes (bonus if able to show their props as well)

import { searchMedia } from "./media";

import { generateAvatar, generateName, generateDescription } from "./profile";

import { parseUserAgent } from "./device";

// TODO: Don't import routes here; add socketAPIRoute on the routes themselves...
import {
  SOCKET_API_ROUTE_LOOPBACK,
  SOCKET_API_ROUTE_FETCH_NETWORKS,
  SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS,
  SOCKET_API_ROUTE_FETCH_ICE_SERVERS,
  SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION,
  SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT,
  SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION,
  SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE,
  SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR,
  SOCKET_API_ROUTE_GENERATE_PROFILE_NAME,
  SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION,
  SOCKET_API_ROUTE_MEDIA_SEARCH,
  SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION,
} from "@shared/socketAPIRoutes";

import {
  initVirtualServerSession,
  setParticipantCount,
  endVirtualServerSession,
  fetchNetworks,
  fetchIsNetworkOnline,
  fetchICEServers,
  setBackgroundImage,
} from "./network";

import addSocketAPIRoute from "./addSocketAPIRoute";

export default function initSocketAPIRoutes() {
  // Loopback - Whatever is sent is returned
  addSocketAPIRoute(SOCKET_API_ROUTE_LOOPBACK, data => {
    return data;
  });

  // TODO: Add query interface
  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_NETWORKS, fetchNetworks);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS,
    fetchIsNetworkOnline
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_ICE_SERVERS, fetchICEServers);

  // TODO: Extend to handle mesh networks
  addSocketAPIRoute(
    SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION,
    initVirtualServerSession
  );

  addSocketAPIRoute(
    SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT,
    setParticipantCount
  );

  // TODO: Extend to handle mesh networks
  addSocketAPIRoute(
    SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION,
    endVirtualServerSession
  );

  addSocketAPIRoute(
    SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE,
    setBackgroundImage
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR, generateAvatar);

  addSocketAPIRoute(SOCKET_API_ROUTE_GENERATE_PROFILE_NAME, generateName);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION,
    generateDescription
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_MEDIA_SEARCH, searchMedia);

  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION, parseUserAgent);
}
