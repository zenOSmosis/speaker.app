import React from "react";
import Modal from "../Modal";
import Center from "../Center";
import Cover from "../Cover";

export default function FileDropModal({ ...rest }) {
  return (
    <Modal {...rest}>
      <Center>Drop your file(s) here</Center>
      <Cover
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ width: "98%", height: "98%", border: "10px red dashed" }}
        ></div>
      </Cover>
    </Modal>
  );
}
