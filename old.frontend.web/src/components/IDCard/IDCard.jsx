import React, { useMemo } from "react";
import AutoScaler from "@components/AutoScaler";
import { Orbitron } from "@components/fontFaces";
import Center from "@components/Center";
import Avatar from "@components/Avatar";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

import styles from "./IDCard.module.css";

// @see https://codepen.io/supersarkar/pen/wmNjXm
export default function IDCard({ participant, ...rest }) {
  const { participants } = useWebPhantomSessionContext();

  const { avatarURL, name, description } = useMemo(
    () =>
      participants.find(
        ({ socketIoId }) => participant && socketIoId === participant.socketIoId
      ) || {},
    [participant, participants]
  );

  return (
    <AutoScaler>
      <Orbitron {...rest}>
        <div className={styles["id-card-wrapper"]}>
          <div className={styles["id-card"]}>
            <div className={styles["profile-row"]}>
              <div className={styles["dp"]}>
                <div className={styles["dp-arc-outer"]}></div>
                <div className={styles["dp-arc-inner"]}></div>

                <div className={styles["avatar-wrap"]}>
                  <Center>
                    <Avatar
                      src={avatarURL}
                      name={name}
                      description={description}
                      size="100%"
                    />
                  </Center>
                </div>
              </div>
              <div className={styles["desc"]}>
                {
                  // TODO: Draw out description one letter at a time, maybe w/ a sound effect per letter? (use Howler on frontend?)
                }
                <h1>{name}</h1>
                <p>{description}</p>
              </div>
            </div>
          </div>
        </div>
      </Orbitron>
    </AutoScaler>
  );
}
