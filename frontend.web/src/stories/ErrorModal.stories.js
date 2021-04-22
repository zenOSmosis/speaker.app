import React from "react";
import FullViewport from "@components/FullViewport";
import ErrorModal from "@components/ErrorModal";

const def = {
  title: "ErrorModal",
  component: ErrorModal,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <ErrorModal {...args} />
  </FullViewport>
);

export const ObjectError = Template.bind({});
ObjectError.args = {
  error: new Error("Test error"),
  onClose: () => console.warn("onClose"),
};

export const StringError = Template.bind({});
StringError.args = {
  error: "Test string error",
  onClose: () => console.warn("onClose"),
};
