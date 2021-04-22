import React, { useCallback, useEffect, useState } from "react";

import useViewportSize from "@hooks/useViewportSize";
import useLocalStorage from "@hooks/useLocalStorage";
import useAppRoutesContext from "@hooks/useAppRoutesContext";

import getIsClass from "@shared/getIsClass";

// TODO: Implement hiding of panels when using small viewport and software keyboard is activated

export const AppLayoutContext = React.createContext({});

const LOCAL_STORAGE_KEY_HIDE_OPENING_SCENE = "hide-opening-scene";

// TODO: Update document title on menu selection
export default function AppLayoutProvider({
  children,
  onOpenProfile,
  ...rest
}) {
  // This is what will render in the app content's main view panel
  const [mainView, setMainView] = useState(null);
  const [modalView, setModalView] = useState(null);

  // Bind route views w/ local views
  const {
    mainView: routeMainView,
    modalView: routeModalView,
    openRoute,
  } = useAppRoutesContext();
  useEffect(() => {
    setMainView(routeMainView);
    setModalView(routeModalView);
  }, [routeMainView, routeModalView]);

  const { getItem, setItem } = useLocalStorage();

  // TODO: Memoize
  const isShowingOpeningScene =
    getItem(LOCAL_STORAGE_KEY_HIDE_OPENING_SCENE) !== "yes";

  const setIsShowingOpeningScene = useCallback(
    (isShowing) =>
      setItem(LOCAL_STORAGE_KEY_HIDE_OPENING_SCENE, !isShowing ? "yes" : "no"),
    [setItem]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Regardless of whether the sidebar is open or not, this determines if it
   * will overlay the content.
   *
   * @type {boolean}
   **/
  const [isSidebarOverlay, _setIsSidebarOverlay] = useState(true);
  useViewportSize(
    ({ width }) => {
      const testIsSidebarOverlay = width < 760;

      if (isSidebarOverlay !== testIsSidebarOverlay) {
        _setIsSidebarOverlay(testIsSidebarOverlay);
      }
    },
    [isSidebarOverlay]
  );

  // Used to force sub-menu state to refresh
  // TODO: Rename?
  // TODO: Can forceUpdate be used instead?
  const [sidebarRenderTime, setSidebarRenderTime] = useState(0);

  const [sidebarMenuSelectedIdx, setSidebarMenuSelectedIdx] = useState(-1);

  const resetSidebarMenu = useCallback(() => setSidebarMenuSelectedIdx(-1), []);

  const onSelectedIdxChange = useCallback(
    (newIdx) => {
      if (sidebarMenuSelectedIdx === newIdx) {
        return;
      }

      setSidebarMenuSelectedIdx(newIdx);
    },
    [sidebarMenuSelectedIdx]
  );

  // Hide sidebar if viewport is too narrow and there is a main view
  //
  // TODO: Restore current selected idx after close
  useEffect(() => {
    if (mainView) {
      setIsSidebarOpen(!isSidebarOverlay);
    }
  }, [mainView, isSidebarOverlay, sidebarMenuSelectedIdx]);

  const toggleSidebar = useCallback(() => {
    if (isSidebarOpen && sidebarMenuSelectedIdx !== -1) {
      // Reset menu back to "home" index
      setSidebarRenderTime(new Date().getTime());
      onSelectedIdxChange(-1);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  }, [isSidebarOpen, sidebarMenuSelectedIdx, onSelectedIdxChange]);

  // TODO: handle w/ AppRoutesProvider
  const openProfile = useCallback(
    // TODO: Rename parameter?
    (openProfileQuery) => {
      // Ignore passed components
      //
      // TODO: Maybe a better check would be to determine if React component
      if (getIsClass(openProfileQuery)) {
        openProfileQuery = undefined;
      }

      onOpenProfile({
        openProfileQuery,
        setModalView,
        setMainView,
        setIsSidebarOpen,
        openRoute,
      });
    },
    [onOpenProfile, openRoute]
  );

  return (
    <AppLayoutContext.Provider
      value={{
        // TODO: Remove opening scene props
        isShowingOpeningScene,
        setIsShowingOpeningScene,
        //
        isSidebarOpen,
        setIsSidebarOpen,
        isSidebarOverlay,
        sidebarMenuSelectedIdx,
        resetSidebarMenu,
        onSelectedIdxChange,
        sidebarRenderTime,
        toggleSidebar,
        mainView,
        setMainView,
        modalView,
        setModalView,
        openProfile,
        ...rest,
      }}
    >
      {children}
    </AppLayoutContext.Provider>
  );
}
