import { fetch } from "@shared/SocketAPIClient";
import {
  SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR,
  SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION,
  SOCKET_API_ROUTE_GENERATE_PROFILE_NAME,
} from "@shared/socketAPIRoutes";

/**
 * @param {Object} params? [optional]
 * @return {Promise<string>} Base64 representation of avatar.
 */
export async function generateAvatar(
  params = { string: new Date().getTime(), engine: "male8bit", size: 200 }
) {
  const avatar = await fetch(SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR, params);

  return avatar;
}

/**
 * @return {Promise<string>}
 */
export async function generateDescription() {
  return fetch(SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION);
}

/**
 * @return {Promise<string>}
 */
export async function generateName() {
  return fetch(SOCKET_API_ROUTE_GENERATE_PROFILE_NAME);
}
