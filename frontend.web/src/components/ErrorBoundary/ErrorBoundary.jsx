import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import ErrorModal from "../ErrorModal";

export default class ErrorBoundary extends Component {
  static propTypes = {
    /**
     * Utilized to filter out ErrorPage handling.
     *
     * Called with the error as the argument.  If it returns false, it will not
     * render the ErrorPage.
     */
    onBeforeRenderErrorPage: PropTypes.func,
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { error };
  }

  /**
   * @param {Error} error
   * @return {boolean}
   */
  static shouldShowError(error) {
    if (!error || !error.message) {
      return false;
    }

    return true;
  }

  constructor(props) {
    super(props);

    this.state = {
      /** @type {Error} */
      error: null,

      /** @type {string} */
      errorType: null,
    };

    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    this.handleError = this.handleError.bind(this);
    this.resetError = this.resetError.bind(this);

    this.ErrorPage = props.ErrorPage;
  }

  componentDidUpdate() {
    // Allow ErrorPage to be overridden with new version
    this.ErrorPage = this.props.ErrorPage;
  }

  componentDidMount() {
    // Set up unhandledrejection handling
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );

    // Catch any errors not caught up in React, itself (i.e. timeout errors,
    // third-party libs, or other code running outside of React)
    window.addEventListener("error", this.handleError);
  }

  componentWillUnmount() {
    // Tear down unhandledrejection handling
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );

    window.removeEventListener("error", this.handleError);
  }

  /**
   * Handle rejected Promises, passing them through handleError, as a normal
   * error is.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
   *
   * @param {PromiseRejectionEvent} evt
   */
  handleUnhandledRejection(evt) {
    const reason = evt.reason;

    // If string, cast to new Error object, or pass existing error through
    this.handleError(typeof reason === "string" ? new Error(reason) : reason);
  }

  /**
   * Common handler which other handlers in this class should call.
   *
   * @param {Error} error
   */
  async handleError(error) {
    const errorType =
      (error && error.constructor && error.constructor.name) || "UntypedError";

    console.warn("Error boundary caught", {
      error,
      errorType,
    });

    this.setState({
      error,
      errorType,
    });
  }

  /**
   * Resets the error so that the error page can disappear without refreshing.
   */
  resetError() {
    this.setState({
      error: null,
      errorType: null,
    });
  }

  /**
   * @param {Error} error
   * @param {Object} errorInfo
   */
  componentDidCatch(error, errorInfo) {
    this.handleError(
      new Error(
        `${error.message} \n\n ${errorInfo && errorInfo.componentStack}`
      )
    );
  }

  render() {
    const { children, onBeforeRenderErrorPage = (error) => true } = this.props;
    const { error, errorType } = this.state;

    // Note (jh): This onBeforeRenderErrorPage filter is used here in render,
    // instead of in handleError, because React will call static
    // getDerivedStateFromError during the error lifecycle, which directly
    // sets the error state which bypasses handleError during at least one
    // render cycle
    const renderedError =
      error &&
      ErrorBoundary.shouldShowError(error) &&
      onBeforeRenderErrorPage(error)
        ? error
        : null;

    const renderedErrorType = renderedError ? errorType : null;

    return (
      <ErrorOrChildrenView
        error={error}
        errorType={renderedErrorType}
        onResetError={this.resetError}
      >
        {children}
      </ErrorOrChildrenView>
    );
  }
}

/**
 * Renders either children of the ErrorBoundary, or the ErrorPage itself,
 * depending on passed props.
 *
 * Note that this also uses React hooks, which aren't available in the
 * class component (while various error lifecycle methods aren't available with
 * hooks, hence the additional component).
 */
function ErrorOrChildrenView({ children, error, errorType, onResetError }) {
  return (
    <Fragment>
      {error ? <ErrorModal error={error} show={true} /> : children}
    </Fragment>
  );
}
