// @see https://3dtransforms.desandro.com/cube

import React, { Component } from "react";
import "./style.css";

export const BOX3D_SIDE_FRONT = "Front";
export const BOX3D_SIDE_RIGHT = "Right";
export const BOX3D_SIDE_LEFT = "Left";
export const BOX3D_SIDE_BACK = "Back";
export const BOX3D_SIDE_TOP = "Top";
export const BOX3D_SIDE_BOTTOM = "Bottom";

export const BOX3D_SIDES = [
  BOX3D_SIDE_FRONT,
  BOX3D_SIDE_RIGHT,
  BOX3D_SIDE_LEFT,
  BOX3D_SIDE_BACK,
  BOX3D_SIDE_TOP,
  BOX3D_SIDE_BOTTOM,
];

export default class Box3D extends Component {
  _degX = 0;
  _degY = 0;
  _translateZ = 100;

  componentDidMount() {
    const { faceFront, rotation } = this.props;
    if (faceFront) {
      this.setFaceContent(BOX3D_SIDE_FRONT, faceFront);
    }

    if (rotation) {
      this.rotate(rotation);
    }
  }

  setPerspective(perspective = 200) {
    window.requestAnimationFrame(() => {
      this._boxScene.style.perspective = `${parseInt(perspective, 10)}px`;
    });
  }

  rotate({ degX = undefined, degY = undefined, translateZ = undefined }) {
    if (degX === undefined) {
      degX = this._degX;
    }

    if (degY === undefined) {
      degY = this._degY;
    }

    if (translateZ === undefined) {
      translateZ = this._translateZ;
    }

    // Render
    window.requestAnimationFrame(() => {
      this._box.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg) translateZ(${translateZ}px)`;
    });

    this._degX = degX;
    this._degY = degY;
    this._translateZ = translateZ;
  }

  // TODO: Build out alias function
  rotateToFace(face) {
    return this.showSide(face);
  }

  // TODO: Remove
  showSide(side) {
    side = side.toUpperCase();

    var showClass = `show-${side}`;
    if (this._currentClass) {
      this._box.classList.remove(this._currentClass);
    }
    this._box.classList.add(showClass);
    this._currentClass = showClass;
  }

  setOpacity(opacity) {
    window.requestAnimationFrame(() => {
      this._box.style.opacity = opacity / 100;
    });
  }

  render() {
    const { children } = this.props;

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div ref={(c) => (this._boxScene = c)} className="Box3DScene">
          <div ref={(c) => (this._box = c)} className="Box">
            <div className="Box__Face Box__Face--FRONT">{children}</div>

            <div className="Box__Face Box__Face--BACK">Back</div>
            <div className="Box__Face Box__Face--RIGHT">Right</div>
            <div className="Box__Face Box__Face--LEFT">Left</div>
            <div className="Box__Face Box__Face--TOP">Top</div>
            <div className="Box__Face Box__Face--BOTTOM">Bottom</div>
          </div>
        </div>
      </div>
    );
  }
}
