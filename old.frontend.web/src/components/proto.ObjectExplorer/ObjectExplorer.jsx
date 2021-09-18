import React, { useState } from "react";
import { get as getPath } from "lodash";

export default function ObjectExplorer({ object = {}, ...rest }) {
  const [path, setPath] = useState(undefined);

  // TODO: Remove
  console.log({
    object,
    path,
  });

  return (
    <div {...rest}>
      <div>
        [header] [TODO: Include traverse]{" "}
        <button onClick={() => setPath(undefined)}>Reset</button>
      </div>

      <ElementView object={object} path={path} onPathChange={setPath} />
    </div>
  );
}

function ElementView({ object, path, onPathChange }) {
  let element = getPath(object, path);
  if (!element) {
    path = "";
    element = object;
  }

  // TODO: Remove
  console.log({
    element,
    type: typeof element,
  });

  switch (typeof element) {
    case "object":
      if (Array.isArray(element)) {
        return `[${element
          .map((val) => {
            if (typeof val === "object") {
              return JSON.stringify(val);
            } else {
              return val;
            }
          })
          .join(", ")}]`;
      }

      return (
        <ul>
          {Object.keys(element).map((key, idx) => {
            return (
              <li key={idx}>
                {key}{" "}
                {typeof element[key] === "object" ? (
                  <button
                    onClick={() =>
                      onPathChange(`${path ? `${path}.` : ""}${key}`)
                    }
                  >
                    >
                  </button>
                ) : (
                  <div>{element[key].toString()}</div>
                )}
              </li>
            );
          })}
        </ul>
      );

    default:
      return element.toString();
  }
}
