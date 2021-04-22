import React from "react";
import ReactDOM from "react-dom";
import "./style.js";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// Extend day.js w/ fromNow() method
dayjs.extend(relativeTime);

(() => {
  const elRoot = document.getElementById("root");

  // FIXME: This should probably only be a temporary measure in case we build
  // out more HTML pages and one were to land on one of the other pages to
  // start the UI
  window.__aboutHTML = elRoot.innerHTML;

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    elRoot
  );

  elRoot.style.display = "block";
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
