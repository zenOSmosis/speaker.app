import React, { useEffect } from "react";
import Modal from "../Modal";
import Center from "../Center";
import ErrorIcon from "../icons/ErrorIcon";
import ReloadIcon from "../icons/ReloadIcon";

export default function ErrorModal({ error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  let errorMessage;

  if (
    error &&
    error.constructor &&
    error.constructor.name === "OverconstrainedError"
  ) {
    errorMessage =
      "Media device has been overconstrained.  It may not be available in this browser configuration.";
  } else {
    errorMessage =
      typeof error === "string"
        ? error
        : typeof error.reason === "string"
        ? error.reason
        : typeof error.message === "string"
        ? error.message
        : "Unknown Error";
  }

  return (
    <Modal>
      <Center canOverflow={true}>
        <div style={{ padding: 8, maxWidth: 1024, display: "inline-block" }}>
          <h1>Whoops!</h1>
          <div>
            <ErrorIcon
              style={{
                color: "red",
                fontSize: "2em",
                padding: 10,
              }}
            />{" "}
            Error: {errorMessage}
          </div>
          <div style={{ marginTop: 8 }}>
            {
              // Note the usage of "true" in reload to try to force reload new
              // version from server instead of cache
            }
            <button
              onClick={() => window.location.reload(true)}
              style={{
                fontSize: "1.4rem",
                fontWeight: "bold",
                backgroundColor: "red",
              }}
            >
              <ReloadIcon /> Reload
            </button>
          </div>
        </div>
      </Center>
    </Modal>
  );
}
