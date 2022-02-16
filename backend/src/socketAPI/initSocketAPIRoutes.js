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

import searchMedia from "./routes/media/searchMedia";

import generateAvatar from "./routes/profile/generateAvatar";
import generateName from "./routes/profile/generateName";
import generateDescription from "./routes/profile/generateDescription";

import parseUserAgent from "./routes/device/parseUserAgent";

import initVirtualServerSession from "./routes/network/initVirtualServerSession";
import setParticipantCount from "./routes/network/setParticipantCount";
import endVirtualServerSession from "./routes/network/endVirtualServerSession";
import fetchNetworks from "./routes/network/fetchNetworks";
import fetchIsNetworkOnline from "./routes/network/fetchIsNetworkOnline";
import fetchICEServers from "./routes/network/fetchICEServers";
import setBackgroundImage from "./routes/network/setBackgroundImage";

import addSocketAPIRoute from "./addSocketAPIRoute";

// FIXME: (jh) A consideration would be to have the routes auto-register
// themselves, and / or extract the SocketAPI into a separate library so it can
// be better tested and better tooling written for it
export default function initSocketAPIRoutes() {
  addSocketAPIRoute(SOCKET_API_ROUTE_LOOPBACK, data => {
    return data;
  });

  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_NETWORKS, fetchNetworks);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS,
    fetchIsNetworkOnline
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_ICE_SERVERS, fetchICEServers);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION,
    initVirtualServerSession
  );

  addSocketAPIRoute(
    SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT,
    setParticipantCount
  );

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
