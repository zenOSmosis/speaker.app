import React from "react";
import Full from "../Full";
import Header from "./Header";
import Content from "./Content";
import Footer from "./Footer";
import { Row, Column } from "./RowColumn";
import styles from "./Layout.module.css";
import classNames from "classnames";

export default function Layout({ className, children, ...rest }) {
  return (
    <Full {...rest} className={classNames(styles["layout"], className)}>
      {children}
    </Full>
  );
}

export { Header, Content, Footer, Row, Column };
