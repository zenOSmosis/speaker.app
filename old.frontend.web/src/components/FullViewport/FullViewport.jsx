import classNames from "classnames";
import PropTypes from "prop-types";
import React, { Component } from "react";

// NOTE: This intentionally does not make use of *.module.css and also includes
// internal styling for the html and body tags
import "./FullViewport.css";

export const EVT_RESIZE = "resize";
export const EVT_TOUCH_END = "touchend";

/**
 * A React Component which utilizes the entire viewport (or what is available
 * beyond the window chrome) of the device.
 *
 * It helps solve layout issue related to mobile layouts (especially on iOS,
 * where the viewport size can change depending if URL bar is shown or hidden),
 * by explicitly setting widths and heights in pixels, so that child elements
 * can utilize size percentages (i.e. height="100%") and fully consume
 * available container layout area.
 *
 * This component is intended to be a direct descendant (or at least near-
 * direct descendant) to the DOM's <body> tag, and works best if the
 * underlying CSS for html & body are not padded, nor have margins.
 *
 * The entire application should be rendered within this component for best
 * results.
 */
export default class FullViewport extends Component {
  static propTypes = {
    onResize: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._ref = null;
    this._pollingInterval = null;
    this._pollingTime = 1000; // In milliseconds

    this._lastPollWidth = 0;
    this._lastPollHeight = 0;
  }

  componentDidMount() {
    this._handleViewportResize();

    window.addEventListener(EVT_RESIZE, this._handleViewportResize);
    window.addEventListener(EVT_TOUCH_END, this._handleTap);

    this._pollingInterval = setInterval(
      this._handleViewportResize,
      this._pollingTime
    );

    // Dynamically add .full-viewport to html / body elements
    document.documentElement.classList.add("full-viewport");
    document.body.classList.add("full-viewport");
  }

  componentWillUnmount() {
    // Dynamically remove .full-viewport from html / body elements
    document.documentElement.classList.remove("full-viewport");
    document.body.classList.remove("full-viewport");

    window.removeEventListener(EVT_RESIZE, this._handleViewportResize);
    window.removeEventListener(EVT_TOUCH_END, this._handleTap);

    clearInterval(this._pollingInterval);
  }

  componentDidUpdate() {
    this._handleViewportResize();
  }

  /**
   * Prevents double-tap zooming on iOS.
   *
   * Note: Source adapted from https://exceptionshub.com/disable-double-tap-zoom-option-in-browser-on-touch-devices.html
   *
   * @param {DocumentEvent} evt Event of touchend type
   */
  _handleTap = (evt) => {
    const t2 = evt.timeStamp;
    const t1 = evt.currentTarget.__lastTouch || t2;
    const dt = t2 - t1;
    const fingers = evt.touches.length;
    evt.currentTarget.__lastTouch = t2;

    if (!dt || dt > 500 || fingers > 1) {
      // Not double-tap
    } else {
      // Prevent double-tap zoom
      evt.preventDefault();
    }
  };

  /**
   * Note: Automatic viewport resizing is called as either a window resizing
   * event callback, or at a set interval time.
   *
   * Depending on whether it is called with an event object, the method will
   * adapt its handling accordingly.
   *
   * @param {DocumentEvent} evt? [default = null] If no evt is passed, it is in
   * polling mode.
   */
  _handleViewportResize = (evt = null) => {
    if (!this._ref) {
      return;
    }

    const isInPollingMode = evt ? false : true;

    // Fixes issue where text input fields can disappear behind mobile keyboard
    // when in use
    // FIXME: Don't run following code block unless on mobile, w/ software
    // keyboard enabled
    if (
      isInPollingMode &&
      document.activeElement &&
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      return;
    }

    // Fixes issue on iOS where the content may be behind the URL bar
    document.body.scrollTop = 0;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // If the width or height hasn't changed since the last poll interval, do
    // nothing
    if (
      isInPollingMode &&
      width === this._lastPollWidth &&
      height === this._lastPollHeight
    ) {
      return;
    } else {
      this._lastPollWidth = width;
      this._lastPollHeight = height;
    }

    this._ref.style.width = `${width}px`;
    this._ref.style.height = `${height}px`;

    if (typeof this.props.onResize === "function") {
      this.props.onResize({
        width,
        height,
      });
    }
  };

  render() {
    let { children, className, onResize, ...propsRest } = this.props;

    return (
      <div
        ref={(c) => (this._ref = c)}
        {...propsRest}
        className={classNames("full-viewport", className)}
      >
        {children}
      </div>
    );
  }
}
