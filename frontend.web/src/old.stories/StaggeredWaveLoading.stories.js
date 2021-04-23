import React from "react";
import FullViewport from "@components/FullViewport";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading";

const def = {
  title: "StaggeredWaveLoading",
  component: StaggeredWaveLoading,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <StaggeredWaveLoading {...args} />
  </FullViewport>
);

export const Proto = Template.bind({});
Proto.args = {};
