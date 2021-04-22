import React from "react";
import FileDropModal from "@components/FileDropModal";
import FullViewport from "@components/FullViewport";

const def = {
  title: "FileDropModal",
  component: FileDropModal,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <FileDropModal {...args} />
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {};
