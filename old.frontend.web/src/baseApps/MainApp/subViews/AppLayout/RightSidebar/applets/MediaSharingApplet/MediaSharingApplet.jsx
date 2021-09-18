import React, { useEffect } from "react";
import Layout, { Content, Footer } from "@components/Layout";

import { FileSharing, MediaView } from "./sections";

import useForceUpdate from "@hooks/useForceUpdate";

export default function MediaSharingApplet() {
  // TODO: Remove UI polling
  // TODO: Document why this is used
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const updateInterval = setInterval(forceUpdate, 1000);

    return function unmount() {
      clearInterval(updateInterval);
    };
  }, [forceUpdate]);

  // const { elPersistentVideoCapture, setSrcFile } = usePersistentVideoCapture();

  // TODO: Remove
  /*
  console.warn({
    elPersistentVideoCapture,
    setSrcFile,
  });
  */

  /*
  const {
    isConnected,
    getIsMediaStreamPublished,
    publishMediaStream,
  } = useWebPhantomSessionContext();
  */

  // const mediaStream = null;

  // const isPublished = mediaStream && getIsMediaStreamPublished(mediaStream);

  return (
    <Layout>
      <Content>
        <div
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <FileSharing />

          <MediaView />
        </div>
      </Content>
      <Footer>
        {/*
          <ButtonPanel
            buttons={[
              {
                content: () => <div>Shared Files</div>,
                onClick: () => null,
              },
              {
                content: () => <div>Media View</div>,
                onClick: () => null,
              },
              {
                content: () => <div>Both</div>,
                onClick: () => null,
              },
            ]}
            defaultSelectedIdx={2}
          />
          */}
      </Footer>
    </Layout>
  );
}

// let _cachedPersistenceView = null;

// TODO: Remove
/*
const OLD_MediaDeckPersistenceView = React.forwardRef(
  function MediaSharingAppletPersistenceView({ ...rest }, forwardedRef) {
    const [files, _setFiles] = useState([]);
    const [videoEl, _setVideoEl] = useState(null);

    const [mediaStream, _setMediaStream] = useState(null);

    const [error, _setError] = useState(null);

    const [
      mediaStreamAudioController,
      _setMediaStreamAudioController,
    ] = useState(null);

    useEffect(() => {
      if (mediaStream) {
        _setMediaStreamAudioController(
          new MediaStreamAudioController(mediaStream)
        );
      }
    }, [mediaStream]);

    // TODO: Remove
    useEffect(() => {
      // TODO: Remove
      console.debug({
        mediaStream,
        // mediaStreamAudioController,
        audioTracks: mediaStream && mediaStream.getAudioTracks(),
      });

      // TODO: Remove
      if (mediaStreamAudioController) {
        mediaStreamAudioController.setIsMonitoring(true);
      }
    }, [mediaStream]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        // TODO: Remove
        setFiles: _setFiles,
        getFiles: () => files,

        getVideoEl: () => videoEl,

        play: () => videoEl && videoEl.play(),
        pause: () => videoEl && videoEl.pause(),

        getMediaStream: () => mediaStream,

        getError: () => error,

        // getMediaStreamAudioController: () => mediaStreamAudioController,

        // setIsMonitoring: _setIsMonitoring,
        // getIsMonitoring: () => isMonitoring,
      }),
      [videoEl, files, mediaStream, error]
    );

    // Auto-play when files change
    useEffect(() => {
      if (videoEl && files.length) {
        videoEl.play().catch((err) => console.warn("Caught", err));
      }
    }, [files, videoEl]);

    const src = useMemo(
      () => files && files[0] && URL.createObjectURL(files[0]),
      [files]
    );

    useEffect(() => {
      if (error) {
        console.debug("Caught", error);
      }
    }, [error]);

    if (error) {
      return <div>This browser may not be supported for media capturing.</div>;
    }

    if (!files.length) {
      return null;
    }

    return null;

    // TODO: Hide video capture if local monitoring is disabled
    // TODO: Don't use PersistenceView container here
    return (
      <VideoCapture
        onEl={_setVideoEl}
        src={src}
        style={{ opacity: 0.5 }} // TODO: Make configurable
        onMediaStream={_setMediaStream}
        onError={_setError}
        // TODO: Disable and hide
        controls
      />
    );
  }
);
*/
