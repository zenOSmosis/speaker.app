import React from "react";
import Center from "../Center";
import Modal from "../Modal";

export default function ConnectModal({ ...rest }) {
  return (
    <Modal {...rest}>
      <Center>
        <div
          style={{
            width: 360,
            height: 200,
            border: "1px red solid",
            display: "inline-block",
          }}
        >
          [connect]
        </div>
      </Center>
    </Modal>
  );
}
