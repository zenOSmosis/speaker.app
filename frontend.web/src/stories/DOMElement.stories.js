import React from "react";
import DOMElement from "@components/DOMElement";

const def = {
  title: "DOMElement",
  component: DOMElement,
};

export default def;

const Template = (args) => <DOMElement {...args} />;

export const Default = Template.bind({});
Default.args = {
  el: (() => {
    const el = document.createElement("el");

    el.style.backgroundColor = "red";
    el.style.padding = "50px";

    el.innerHTML = "A generic DOM element";

    return el;
  })(),
};
