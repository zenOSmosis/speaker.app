const _socketAPIRouteHandlers = {};

// TODO: Document
export function getSocketAPIRouteHandlers() {
  return _socketAPIRouteHandlers;
}

// TODO: Document
export default function addSocketAPIRoute(routeName, handler) {
  _socketAPIRouteHandlers[routeName] = handler;
}
