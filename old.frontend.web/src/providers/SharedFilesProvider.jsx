import React, { createContext, useCallback, useEffect, useState } from "react";

export const SharedFilesContext = createContext({});

// TODO: Document
export default function SharedFilesProvider({ children }) {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [openedSharedFiles, setOpenedSharedFiles] = useState([]);

  /*
  const [elPersistentVideoCapture, setElPersistentVideoCapture] = useState(
    null
  );
  */

  const getIsFileOpen = useCallback(
    (file) => openedSharedFiles.includes(file),
    [openedSharedFiles]
  );

  // Filtering to remove opened files that are not currently being shared
  useEffect(() => {
    const discardedFiles = [];

    for (const openedFile of openedSharedFiles) {
      if (!sharedFiles.includes(openedFile)) {
        discardedFiles.push(openedFile);
      }
    }

    if (discardedFiles.length) {
      setOpenedSharedFiles((openedSharedFiles) =>
        openedSharedFiles.filter((file) => !discardedFiles.includes(file))
      );
    }
  }, [sharedFiles, openedSharedFiles]);

  return (
    <SharedFilesContext.Provider
      value={{
        sharedFiles,
        setSharedFiles,
        openedSharedFiles,
        setOpenedSharedFiles,
        getIsFileOpen,
        // elPersistentVideoCapture,
        // setElPersistentVideoCapture,
      }}
    >
      {children}
    </SharedFilesContext.Provider>
  );
}
