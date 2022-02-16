/**
 * Node clustering with Socket.io based on information obtained from:
 * @link https://github.com/elad/node-cluster-socket.io
 *
 *
 * Potentially with ReShell's "host-bridge" support, the Socket.io Cluster
 * adapter might be of better use, and / or parts of it can be used to improve
 * this current setup.
 * @link https://socket.io/docs/v4/cluster-adapter/
 */

import "./node.console";
import cluster from "cluster";
import express from "express";
import httpProxy from "http-proxy";
import net from "net";
import farmhash from "farmhash";
import socketIo from "socket.io";
import socketIoRedis from "socket.io-redis";
import { cpus } from "os";
import SocketController from "./SocketController";
import NetworkController from "./NetworkController";

const lenCPUs = cpus().length;

const { EXPRESS_PORT, REDIS_HOST, REDIS_PORT } = process.env;

// TODO: isMaster is deprecated; use isPrimary on Node v16+
if (cluster.isMaster) {
  (async () => {
    // Remove existing dangling networks for this host
    //
    // This fixes an issue where servers would stay persistent after the server
    // is restarted
    await (async () => {
      const danglingHostNetworkController = new NetworkController();
      await danglingHostNetworkController.onceReady();

      // Remove dangling networks for this host
      await danglingHostNetworkController.deactivateHostNetworks();

      if (!danglingHostNetworkController.getIsDestroying()) {
        await danglingHostNetworkController.destroy();
      }
    })();

    console.log(
      `Hello from master process on ${process.env.GIT_BRANCH} branch with build hash ${process.env.GIT_HASH}.  Starting initialization sequence.`
    );

    // Perform initial Sequelize sync on master thread, ensuring the schema is
    // properly set up before passing off to workers
    // initSequelize(true).then(async dbModels => {
    // Reset any currently active socket connections for this host (as they're
    // all disconnected)
    // await BackendSocketSession.setInactiveForAllOnHost();

    // This stores our workers. We need to keep them to be able to reference
    // them based on source IP address. It's also useful for auto-restart,
    // for example.
    const workers = [];

    // Helper function for spawning worker at index 'i'
    const spawn = function (i) {
      workers[i] = cluster.fork({
        CPU_NO: i,
      });

      /*
      workers[i].on("online", () => {
        console.log(`HTTP worker ${i} is online`);
      });
      */

      // Optional: Restart worker on exit
      workers[i].on("exit", () => {
        console.log("respawning worker", i);
        spawn(i);
      });
    };

    // Spawn workers
    for (let i = 0; i < lenCPUs; i++) {
      spawn(i);
    }

    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing non numeric
    // characters, then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.
    const worker_index = function (ip, len) {
      return farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and
      // works with IPv6, too
    };

    // Create the outside facing server listening on our port
    net
      .createServer({ pauseOnConnect: true }, function (connection) {
        // We received a connection and need to pass it to the appropriate
        // worker. Get the worker for this connection's source IP and pass
        // it the connection.

        const isUsingFarmhash =
          process.env["PROTO_SKIP_FARMHASH"] == 1 ? false : true;

        let worker;
        if (isUsingFarmhash) {
          worker = workers[worker_index(connection.remoteAddress, lenCPUs)];
        } else {
          worker = workers[0]; // TODO: Convert to round-robin
        }

        worker.send("sticky-session:connection", connection);
      })
      .listen(EXPRESS_PORT);
    // });
  })();
} else {
  // Worker thread

  const { CPU_NO } = process.env;

  console.log(`Hello from CPU # ${CPU_NO}`);

  // This must be included at the beginning of the stack in order to properly
  // detect the Node.js uptime
  // require('utils/node/nodeUptime');

  // Note we don't use a port here because the master listens on it for us
  const app = new express();

  // Don't expose our internal server to the outside
  const server = app.listen(0, "localhost");

  // Listen to messages sent from the master. Ignore everything else.
  process.on("message", function (message, connection) {
    if (message !== "sticky-session:connection") {
      return;
    }

    // Emulate a connection event on the server by emitting the
    // event with the connection the master sent us.
    server.emit("connection", connection);

    connection.resume();
  });

  (async () => {
    const networkController = new NetworkController();
    await networkController.onceReady();

    // Prototype Socket.io
    (() => {
      const io = socketIo(server, {
        // NOTE: A goal of Speaker.app is to not use cookies and provide as
        // little state as possible
        cookie: false,
      });

      // Tell Socket.IO to use the redis adapter. By default, the redis
      // server is assumed to be on localhost:6379. You don't have to
      // specify them explicitly unless you want to change them.
      io.adapter(
        socketIoRedis({
          host: REDIS_HOST,
          port: REDIS_PORT,
        })
      );

      // Manages the individual Socket.io connections
      SocketController.initWithSocketIo(io);
    })();
  })();

  // Proxy the React frontend through the backend
  //
  // NOTE: The development /sock-js wss route for hot reloading is handled via
  // the dev_ssl_proxy nginx server (located in the /dev_ssl_proxy directory
  // of the project)
  (() => {
    const proxyServer = httpProxy.createProxyServer();

    // TODO: Implement ability to overwrite frontend response (for SEO, etc.)
    /*
    proxyServer.on("proxyRes", (proxyRes, req, res) => {
      console.log({
        raw: "RAW Response from the target",
        headers: JSON.stringify(proxyRes.headers, true, 2),
        keys: Object.keys(proxyRes),
        url: req.url,
      });
    });
    */

    const FRONTEND_PROXY_URL = process.env.FRONTEND_PROXY_URL;

    app.get("/*", (req, res) => {
      proxyServer.web(req, res, { target: FRONTEND_PROXY_URL }, err => {
        // TODO: Implement better frontend server error handling
        console.error(err);

        res.status(500).send("Frontend server offline");
      });
    });
  })();
}

process.on("uncaughtException", function (err) {
  console.error(new Date().toUTCString() + " uncaughtException:", err.message);
  console.error(err.stack);

  // Intentionally holding off on exiting process for now
  // process.exit(1)
});
