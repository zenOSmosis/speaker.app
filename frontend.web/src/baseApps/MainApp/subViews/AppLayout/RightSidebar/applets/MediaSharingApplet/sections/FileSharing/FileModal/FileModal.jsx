import React, { useCallback } from "react";
import Animation from "@components/Animation";
import Modal from "@components/Modal";
import AutoScaler from "@components/AutoScaler";
import Cover from "@components/Cover";
import Center from "@components/Center";
import Layout, { Content, Footer } from "@components/Layout";
import FileButton from "../FileButton";

import styles from "./FileModal.module.css";

import useSharedFilesContext from "@hooks/useSharedFilesContext";

import bytesToSize from "@shared/string/bytesToSize";

export default function FileModal({ file, onOpenFile, onRemoveFile, onClose }) {
  const handleOpenFile = useCallback(() => onOpenFile(file), [
    file,
    onOpenFile,
  ]);
  const handleRemoveFile = useCallback(
    () =>
      window.confirm(
        `Are you sure you wish to remove "${file.name}" from your shared files?`
      ) && onRemoveFile(file),
    [file, onRemoveFile]
  );

  const { getIsFileOpen } = useSharedFilesContext();

  return (
    <Modal onClose={onClose} className={styles["file-modal"]}>
      <Layout>
        <Content className={styles["main-content"]}>
          <Cover>
            <Animation animationName="backInUp" animationDuration="1s">
              <AutoScaler style={{ opacity: ".2" }}>
                <FileButton file={file} isOpen={getIsFileOpen(file)} />
              </AutoScaler>
            </Animation>
          </Cover>

          <Animation animationName="fadeIn" animationDuration=".25s">
            <Cover>
              <Center>
                <div>
                  <div className={styles["control-buttons"]}>
                    <h1>What do you want to do?</h1>
                    <div>
                      <button
                        style={{ backgroundColor: "green" }}
                        onClick={handleOpenFile}
                      >
                        Play "{file.name}"
                      </button>
                    </div>
                    <div>
                      <button
                        style={{ backgroundColor: "red" }}
                        onClick={handleRemoveFile}
                      >
                        Remove from Sharing
                      </button>
                    </div>
                    <div>
                      <button
                        style={{ backgroundColor: "blue" }}
                        onClick={onClose}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </Center>
            </Cover>
          </Animation>
        </Content>
        <Footer style={{ padding: 4, backgroundColor: "blue" }}>
          <span style={{ fontWeight: "bold" }}>{file.name}</span>{" "}
          {bytesToSize(file.size)}
        </Footer>
      </Layout>
      >
    </Modal>
  );
}
