import React, { useState } from "react";
import Modal from "../Modal";
import Layout, { Header, Content, Footer } from "../Layout";

import classNames from "classnames";
import styles from "./SystemModal.module.css";

import useViewportSize from "@hooks/useViewportSize";

export const THEME_DARK = "dark";
export const THEME_DARKER = "darker";

let _prevIsSmallViewport = false;

/**
 * SystemModal is inspired by OS setup screens, and is typically used outside
 * of the main application to drive any sort of helper utilities needed to
 * configure the application.
 */
export default function SystemModal({
  children,
  className,
  headerView,
  footerView,
  theme = THEME_DARK,
}) {
  const [isSmallViewport, _setIsSmallViewport] = useState(_prevIsSmallViewport);

  // Cache value for next full SystemModal lifecycle
  //
  // Fixes issue where display readjusts when switching navigation links in
  // SystemModal
  _prevIsSmallViewport = isSmallViewport;

  useViewportSize(({ width, height }) => {
    if (width < 500 || height < 600) {
      _setIsSmallViewport(true);
    } else {
      _setIsSmallViewport(false);
    }
  });

  return (
    <Modal
      className={classNames(
        styles["system-modal"],
        isSmallViewport ? styles["small-viewport"] : null,
        styles[theme],
        className
      )}
    >
      <div className={styles["outer-wrap"]}>
        <div className={styles["inner-wrap"]}>
          <Layout>
            <Header className={styles["header"]}>
              {typeof headerView === "function" ? headerView() : headerView}
            </Header>
            <Content>{children}</Content>
            <Footer className={styles["footer"]}>
              {typeof footerView === "function" ? footerView() : footerView}
            </Footer>
          </Layout>
        </div>
      </div>
    </Modal>
  );
}
