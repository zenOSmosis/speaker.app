import React, { useCallback } from "react";
import { Section } from "@components/Layout";
import FileButton from "./FileButton";
import FileModal from "./FileModal";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useSharedFilesContext from "@hooks/useSharedFilesContext";

import TrashIcon from "@icons/TrashIcon";

export default function FileSharing() {
  const { setModalView } = useAppLayoutContext();
  const handleModalClose = useCallback(() => setModalView(null), [
    setModalView,
  ]);

  const {
    sharedFiles,
    setSharedFiles,
    setOpenedSharedFiles,
    getIsFileOpen,
  } = useSharedFilesContext();

  // Utilized only with <input type="file" />
  const handleInputAddFiles = useCallback(
    (evt) => {
      const newFiles = [...evt.target.files];

      setSharedFiles((sharedFiles) => {
        // NOTE (jh): [...new Set()] appears to allow duplicates here
        return [
          ...sharedFiles,
          ...newFiles.filter((newFile) => {
            for (const existingFile of sharedFiles) {
              if (
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
              ) {
                console.warn(
                  `Ignoring duplicate file with name "${newFile.name}"`
                );

                return false;
              }
            }

            return true;
          }),
        ];
      });
    },
    [setSharedFiles]
  );

  const handleOpenFile = useCallback(
    (file) => {
      // TODO: Include ability to open non-media file types

      handleModalClose();

      // Set as array
      // TODO: Include ability to open more than one file at once...?
      setOpenedSharedFiles([file]);
    },
    [handleModalClose, setOpenedSharedFiles]
  );

  const handleRemoveFile = useCallback(
    (file) =>
      setSharedFiles((sharedFiles) => {
        const lSet = new Set([...sharedFiles]);

        lSet.delete(file);

        handleModalClose();

        return [...lSet];
      }),
    [setSharedFiles, handleModalClose]
  );

  const handleEmptyFiles = useCallback(
    () =>
      window.confirm("Are you sure you wish to empty the shared file list?") &&
      setSharedFiles([]),
    [setSharedFiles]
  );

  return (
    <Section>
      <h1>File Sharing</h1>

      <div> Choose which media you can share with other participants.</div>

      <Section>
        <div style={{ overflow: "auto" }}>
          <div style={{ float: "left" }}>
            <h2>
              {sharedFiles.length} shared file
              {sharedFiles.length !== 1 ? "s" : null}
            </h2>
          </div>

          <div style={{ float: "right", marginTop: 8 }}>
            <button onClick={handleEmptyFiles} disabled={!sharedFiles.length}>
              <span style={{ fontWeight: "bold" }}>Empty</span>{" "}
              <TrashIcon style={{ fontSize: "1.2em" }} />
            </button>
          </div>
        </div>

        {sharedFiles.length > 0 && (
          <div className="note">A browser refresh will clear this list.</div>
        )}

        <div>
          {sharedFiles.length ? (
            sharedFiles.map((file, idx) => (
              <FileButton
                key={idx}
                isOpen={getIsFileOpen(file)}
                file={file}
                onClick={() =>
                  setModalView(() => (
                    <FileModal
                      file={file}
                      onOpenFile={handleOpenFile}
                      onRemoveFile={handleRemoveFile}
                      onClose={handleModalClose}
                    />
                  ))
                }
              />
            ))
          ) : (
            <div
              style={{
                margin: 4,
                padding: 12,
                fontSize: "2rem",
                fontWeight: "bold",
                backgroundColor: "rgba(0,0,0,.4)",
                opacity: 0.5,
                borderRadius: 4,
              }}
            >
              You are not sharing any files.
            </div>
          )}
        </div>

        <div>
          <p className="note">
            At this time, only audio and video types are supported.
          </p>
          <input
            type="file"
            multiple
            onChange={handleInputAddFiles}
            // TODO: Accept more than audio / video type
            accept="audio/*,video/*"
            // Clear the file list on every update, as it may show the count of
            // selected files which may differ from the total shared
            value=""
          />
        </div>
      </Section>

      <Section>
        <div>TODO: L-pods: Share files out conventional HTTPS</div>
      </Section>
      {/*
          <p>
          When published, all other participants can see and hear the content.
        </p>
        <button
          onClick={() => mediaStream && publishMediaStream(mediaStream)}
          disabled={!mediaStream || !isConnected}
        >
          Publish <LED color={isPublished ? "green" : "gray"} />
        </button>
          */}
    </Section>
  );
}
