// TODO: Combine forces w/ ReShell's HostBridge SocketAPI:
// @see {@link https://github.com/jzombie/pre-re-shell/blob/master/host.bridge-prototype/src/SocketAPI.js}

import { getSocketAPIRouteHandlers } from "./addSocketAPIRoute";
import initSocketAPIRoutes from "./initSocketAPIRoutes";

// Pre-register the list of routes before the SocketAPI is init.
initSocketAPIRoutes();

/**
 * @typedef {import('socket.io').Server} Server
 * @typedef {import('socket.io').Socket} Socket
 */

/**
 * @param {Server} io Instantiated Socket server
 * @param {Socket} socket Instantiated Socket
 * @return {void}
 */
export default function initSocketAPI(io, socket) {
  console.log(`HELLO to socket id: ${socket.id}`);

  // Per-socket SocketAPI task number
  let _taskNumberIdx = -1;

  // Per-socket total number of running tasks
  let totalRunningTasks = 0;

  /**
   * Wrapper around inbound Socket.io events which provides a common interface
   * for error handling and responses.
   *
   * @param {string} routeName
   * @param {function(any): Promise<any>} routeHandler
   * @return {void}
   */
  const registerSocketAPIRoute = (routeName, routeHandler) => {
    // Socket.io event from demo.frontend
    //
    // TODO: Use single socket event for all SocketAPI routes to avoid
    // potential name collisions w/ non-socketAPI routes
    socket.on(routeName, async (clientArgs = {}, ack = () => null) => {
      // Keep track of the current task, for logging purposes
      ++_taskNumberIdx;

      // Currently running tasks, on this thread
      ++totalRunningTasks;

      // Fix issue where same _taskNumberIdx was reported for concurrent tasks
      const taskNumber = _taskNumberIdx;

      let error = null;
      let resp = null;

      try {
        console.log(
          `"${socket.id}" SocketAPI task ${taskNumber} (${routeName}) started [${totalRunningTasks} concurrent]`
        );
        // Run the task associated w/ the API route
        resp = await routeHandler(clientArgs, {
          io,
          socket,
        });
      } catch (err) {
        console.error(err);

        error = err;
      } finally {
        // Basic error serialization
        //
        // Note: There is also this library https://www.npmjs.com/package/serialize-error
        // but I don't think it should be used here
        const errMessage = !error
          ? null
          : error && error.message
          ? error.message
          : error;

        // Response w/ tuple-like, [error, response] signature
        ack([errMessage, resp]);

        // TODO: Measure time spent performing task?
        // @see https://nodejs.org/api/perf_hooks.html#perf_hooks_performance_measurement_apis

        // De-increment total running tasks because this task has ended
        --totalRunningTasks;

        console[!errMessage ? "log" : "error"](
          `"${socket.id}" SocketAPI task ${taskNumber} (${routeName}) ended ${
            !errMessage ? "successfully" : "unsuccessfully"
          } [${totalRunningTasks} concurrent]`
        );
      }
    });
  };

  (() => {
    const routeHandlers = getSocketAPIRouteHandlers();

    for (const [routeName, routeHandler] of Object.entries(routeHandlers)) {
      registerSocketAPIRoute(routeName, routeHandler);
    }
  })();

  // TODO: Use event constant
  socket.on("disconnect", () => {
    console.log(`BYE to socket id: ${socket.id}`);
  });
}
