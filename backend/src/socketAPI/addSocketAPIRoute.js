const _socketAPIRouteHandlers = {};

/**
 * Retrieves the added socket API routes.
 *
 * @return {Object}
 */
export function getSocketAPIRouteHandlers() {
  return _socketAPIRouteHandlers;
}

/**
 * IMPORTANT: At this time, once the SocketAPI is initialized, there can be no
 * more added routes during runtime.
 *
 * @param {string} routeName
 * @param {function(any): Promise<any>} routeHandler
 * @return {void}
 */
export default function addSocketAPIRoute(routeName, routeHandler) {
  if (_socketAPIRouteHandlers[routeName]) {
    throw new ReferenceError(
      `A route has already been registered with name: ${routeName}`
    );
  }

  if (typeof routeHandler !== "function") {
    throw new TypeError(
      `routeHandler is not a function for route with name: ${routeName}`
    );
  }

  _socketAPIRouteHandlers[routeName] = routeHandler;
}
