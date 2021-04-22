import React from "react";
import Cover from "@components/Cover";
import classNames from "classnames";
import styles from "./RightSidebar_ButtonPanel.module.css";

export default function RightSidebarButtonPanel({
  items = [],
  onSelectIdx = (idx) => console.debug(`Selected idx: ${idx}`),
}) {
  return (
    <div className={styles["button-panel"]}>
      {items.map(
        (
          {
            name,
            content,
            buttonView: ButtonView = () => <div />,
            isDisabled,
            ...rest
          },
          idx
        ) => {
          return (
            <button
              key={idx}
              className={classNames(
                styles["panel-button"]
                // "animate__animated animate__flipInY"
              )}
              // style={{ animationDelay: `${idx / 28}s` }}
              disabled={isDisabled}
              onClick={() => onSelectIdx(idx)}
            >
              <Cover>
                <div className={styles["cover-content-wrapper"]}>
                  <div className={styles["item-name"]}>{name}</div>

                  <div className={styles["item-content"]}>
                    <ButtonView />
                  </div>
                </div>
              </Cover>
            </button>
          );
        }
      )}
    </div>
  );
}
