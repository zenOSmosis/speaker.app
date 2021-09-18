import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

DOMElement.propTypes = {
  el: PropTypes.instanceOf(HTMLElement).isRequired,

  onMount: PropTypes.func,

  onBeforeUnmount: PropTypes.func,
};

/**
 * Render DOM elements as React components.
 *
 * This provides an avenue for direct DOM rendering, incorporating non-React
 * components, etc.
 */
export default function DOMElement({
  el,
  isScaling = false,
  onMount = () => null,
  onBeforeUnmount = () => null,
  ...rest
}) {
  const [elWrap, setElWrap] = useState(null);

  const refOnMount = useRef(onMount);
  const refOnBeforeUnmount = useRef(onBeforeUnmount);

  // Handle onMount
  useEffect(() => {
    if (el && elWrap) {
      elWrap.appendChild(el);

      refOnMount.current();
    }
  }, [el, elWrap]);

  // Handle onUnmount
  useEffect(() => {
    const onBeforeUnmount = refOnBeforeUnmount.current;

    return function unmount() {
      onBeforeUnmount();
    };
  }, []);

  // TODO: Use CSS class
  return (
    <div {...rest} style={{ display: "inline-block" }} ref={setElWrap}></div>
  );
}
