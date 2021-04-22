import React from "react";
import FullViewport from "@components/FullViewport";
import ConnectModal from "@components/ConnectModal";

const def = {
  title: "ConnectModal",
  component: ConnectModal,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <ConnectModal {...args} />
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {
  show: true,
};
