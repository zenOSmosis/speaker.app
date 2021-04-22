// TODO: Ensure process doesn't fail on uncaught exceptions when in production

import "./ControllerIPCMessageBroker";

/*
const wss = new WebSocket.Server({
  port: WS_LISTEN_PORT,
});
*/

// TODO: Move to ControllerIPCMessageBroker
/*
wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    // TODO: Handle following
    // - PING
    // - CONNECT(realmName, roomName) [socket drop will disconnect]

    console.log("received: %s", message);


    // ws.send("loopback message: " + message);

    await (async () => {
      // TODO: Remove
      console.log("Loading Chrome page");

      // TODO: Move to Headless Chrome Session Controller
      const browser = await puppeteer.connect({
        // For debugging; wait for manual resume interaction
        // browserWSEndpoint: `${browserWSEndpoint}?pause`,

        browserWSEndpoint,
        ignoreHTTPSErrors: true,
      });

      // TODO: Reimplement
      // ws.send("hello");

      const page = await browser.newPage();
      await page.setJavaScriptEnabled(true);

      await page.exposeFunction(
        "emitPuppeteerEvent",
        (eventName, eventData) => {
          switch (eventName) {
            case "pong":
              // TODO: Utilize ControllerIPCMessageBroker.sendMessage(...)
              ws.send(
                JSON.stringify({
                  serviceEntityFrom: "...",
                  serviceEntityTo: "...",
                  messageId: eventName,
                  messageData: eventData,
                })
              );
              break;

            default:
              console.error("Unhandled emitPuppeteerEvent", {
                eventName,
                eventData,
              });
          }

          // TODO: Remove
          console.log({
            receivedEvent: {
              eventName,
              eventData,
            },
          });
        }
      );

      // Pipe page console.log to console.log
      page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

      // TODO: Remove
      console.log({
        browserPageUrl,
      });

      await page.goto(browserPageUrl);

      page.on("error", function (error) {
        throw error;
      });

      // TODO: Hold open
      browser.close();
    })();
  });
});
*/
