import React, { useCallback, useState } from "react";
import ButtonTransparent from "@components/ButtonTransparent";
import Modal from "@components/Modal";
import Center from "@components/Center";
import ColorPickerWheel from "@components/ColorPickerWheel";
import ColorSwatch from "@components/ColorSwatch";
import EscapeKey from "@components/computerKeyboardKeys/EscapeKey";
import PropTypes from "prop-types";

TensorFlowAppletColorPickerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function TensorFlowAppletColorPickerModal({
  onClose,
  onChange,
}) {
  const [color, setColor] = useState("gray");

  const handleColorSelect = useCallback(() => {
    onChange(color);
    onClose();
  }, [color, onChange, onClose]);

  return (
    <Modal>
      <Center>
        <div>
          <EscapeKey onClick={onClose} /> Press to exit
          <div>
            <ColorPickerWheel onChange={setColor} />
          </div>
          <div style={{ marginTop: 4 }}>
            <ButtonTransparent onClick={handleColorSelect}>
              <ColorSwatch color={color} /> Tap to use this color
            </ButtonTransparent>
          </div>
        </div>
      </Center>
    </Modal>
  );
}
