// import "./console.log.modifier"; // TODO: Re-enable?

import ChromeIPCMessageBroker from "./ChromeIPCMessageBroker";

// TODO: Only lazy-load debug frontend when in development
import React from "react";
import ReactDOM from "react-dom";
import PhantomServerDebugger from "./components/PhantomServerDebugger";

// Expose to controller
window.__ChromeIPCMessageBroker = ChromeIPCMessageBroker;

ReactDOM.render(
  <React.StrictMode>
    <PhantomServerDebugger />
  </React.StrictMode>,
  document.getElementById("root")
);

// import { ChromeZenRTCPeer } from "./ChromeZenRTCPeer";

console.log("Hello from Chrome");
