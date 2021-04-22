import React, { useEffect, useMemo } from "react";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import Layout, { Header, Content, Footer } from "@components/Layout";
// import { Video } from "@components/AV";
import RightSidebarButtonPanel from "../RightSidebar.ButtonPanel";
import classNames from "classnames";
import styles from "./RightSidebar_Menu.module.css";

const IDX_MENU_VIEW = -1;

export default function RightSidebarMenu({ items = [], isOpen, ...rest }) {
  const {
    sidebarMenuSelectedIdx: selectedItemIdx,
    onSelectedIdxChange,
  } = useAppLayoutContext();

  const { view: ButtonPanelLayoutView, onClick } = useItem({
    items,
    selectedItemIdx,
    onSelectIdx: onSelectedIdxChange,
  });

  // Reset when not active
  useEffect(() => {
    if (!isOpen) {
      onSelectedIdxChange(IDX_MENU_VIEW);
    }
  }, [isOpen, onSelectedIdxChange]);

  // Handle items with click handlers
  useEffect(() => {
    if (typeof onClick === "function") {
      onClick();

      // Reset the menu
      onSelectedIdxChange(IDX_MENU_VIEW);
    }
  }, [onClick, onSelectedIdxChange]);

  useEffect(() => {
    onSelectedIdxChange(selectedItemIdx);
  }, [selectedItemIdx, onSelectedIdxChange]);

  return (
    <Layout className={styles["right-sidebar-menu"]}>
      {selectedItemIdx !== -1 && (
        <Header>
          <select
            className={classNames(
              styles["view-selector"],
              selectedItemIdx !== -1 && styles["highlight"]
            )}
            onChange={(evt) => {
              onSelectedIdxChange(parseInt(evt.target.value, 10));
            }}
            value={selectedItemIdx}
          >
            <option value={IDX_MENU_VIEW}>Menu Items</option>
            <optgroup label="Views">
              {items.map(({ name, isDisabled }, idx) => (
                <option key={idx} value={idx} disabled={isDisabled}>
                  {name}
                </option>
              ))}
            </optgroup>
          </select>
        </Header>
      )}
      <Content>
        <ButtonPanelLayoutView
          key={`contentview-${selectedItemIdx}`}
          {...rest}
        />
      </Content>
    </Layout>
  );
}

// TODO: Document
// Use menu item at selected index
function useItem({ items, selectedItemIdx, onSelectIdx }) {
  const {
    name,
    view = () => (
      <Layout>
        <Content>
          {
            // <Video style={{ width: "100%", height: "100%" }} />
          }
        </Content>
        <Footer>
          <RightSidebarButtonPanel items={items} onSelectIdx={onSelectIdx} />
        </Footer>
      </Layout>
    ),
    onClick = null,
    ...rest
  } = useMemo(() => items[selectedItemIdx] || {}, [items, selectedItemIdx]);
  return {
    name,
    view,
    onClick,
    ...rest,
  };
}
