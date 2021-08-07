import React, { useCallback, useEffect, useMemo, useState } from "react";
import { generatePath, matchPath, useHistory } from "react-router";

import { getCallURL } from "@baseApps/MainApp/routes";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export const AppRoutesContext = React.createContext({});

// TODO: Move into MainApp (this provider doesn't support virtual server app)
export default function AppRoutesProvider({ routes, children }) {
  const { realmId, channelId } = useWebPhantomSessionContext();

  const history = useHistory();

  const [activeRoute, setActiveRoute] = useState(null);
  const [activeRouteState, setActiveRouteState] = useState({});

  const [mainView, setMainView] = useState(null);
  const [modalView, setModalView] = useState(null);

  /**
   * Determines whether or not the passed route is the current location's
   * route.
   *
   * @param {Object} route Route obtained from routes.jsx
   * @param {Object} state? [optional]
   * @return {boolean}
   */
  const getIsCurrentRoute = useCallback(
    (route, state = {}) =>
      Boolean(
        matchPath(history.location.pathname, {
          path: route.path,
          exact: true,
          // When strict is true, the trailing slash on a location’s pathname
          // will be taken into consideration.
          //
          // @see https://reactrouter.com/web/api/NavLink/strict-bool
          strict: false,
        }) && JSON.stringify(state) === JSON.stringify(history.location.state)
      ),
    [history]
  );

  /**
   * Opens the given route.
   *
   * @param {Object} route Route obtained from routes.jsx
   * @param {Object} state? [optional]
   * @return {void}
   */
  const openRoute = useCallback(
    (route, state = {}) => {
      // IMPORTANT: setTimeout is used here to prevent "Cannot update during an
      // existing state transition" errors, caused by calling openRoute from
      // route useController
      setTimeout(() => {
        if (!getIsCurrentRoute(route, state)) {
          // NOTE: Our implementation generates a path off of the given state,
          // and also passes it on to the history call
          //
          // @see https://reactrouter.com/web/api/generatePath
          const generatedPath = generatePath(route.path, state);

          history.push(generatedPath, state);
        }
      });
    },
    [history, getIsCurrentRoute]
  );

  // Trigger following useEffect when location changes
  const location = history.location;

  // Handle dynamic adjustment of views
  useEffect(() => {
    let state = location.state || {};

    const route = Object.values(routes).find(({ path }) => {
      // @see https://reactrouter.com/web/api/matchPath
      const match = matchPath(history.location.pathname, {
        path,
        exact: true,
        // When strict is true, the trailing slash on a location’s pathname
        // will be taken into consideration.
        //
        // @see https://reactrouter.com/web/api/NavLink/strict-bool
        strict: false,
      });

      if (match && match.params) {
        state = { ...state, ...match.params };
      }

      return match;
    });

    if (!route) {
      console.warn("No matched route obtained");

      // FIXME: Use constant value
      history.replace("/404");
    }

    setActiveRoute(route);
    setActiveRouteState(state);

    const MainView = route && route.mainView;
    const ModalView = route && route.modalView;

    if (MainView) {
      setMainView(() => <MainView {...state} />);
    } else {
      setMainView(null);
    }

    if (ModalView) {
      setModalView(() => <ModalView {...state} />);
    } else {
      setModalView(null);
    }
  }, [history, location, routes]);

  const fakeUseController = useCallback(() => null, []);

  const networkURL = useMemo(
    () => realmId && channelId && getCallURL({ realmId, channelId }),
    [realmId, channelId]
  );

  return (
    <AppRoutesContext.Provider
      value={{
        openRoute,
        getIsCurrentRoute,
        mainView,
        modalView,

        activeRoute,
        activeRouteState,

        networkURL,
      }}
    >
      <RouteController
        // FIXME: Passing useController this way is a bit outside of React
        // conventions and triggers this warning:
        //
        // Cannot update during an existing state transition (such as within
        // `render`). Render methods should be a pure function of props and
        // state.
        useController={
          (activeRoute && activeRoute.useController) || fakeUseController
        }
        state={activeRouteState}
        onOpenRoute={openRoute}
      />

      {children}
    </AppRoutesContext.Provider>
  );
}

function RouteController({ useController, state, onOpenRoute }) {
  useController(state, onOpenRoute);

  return null;
}
