import React, { useCallback } from "react";
import Center from "@components/Center";
import Avatar from "@components/Avatar";

import RandomIcon from "@icons/RandomIcon";

import useLocalProfileContext from "@hooks/useLocalProfileContext";

// TODO: Add PropTypes

export default function Profile({ onSave, onCancel }) {
  const handleSubmit = useCallback((evt) => {
    evt.preventDefault();
  }, []);

  // Automatically generate avatar on first load

  const {
    name,
    setName,
    generateName,
    description,
    generateDescription,
    setDescription,
    avatarURL,
    generateAvatar,
    save,
    cancel,
    isDirty,
  } = useLocalProfileContext();

  const handleSave = useCallback(() => {
    save();

    onSave();
  }, [save, onSave]);

  const handleCancel = useCallback(() => {
    cancel();

    onCancel();
  }, [cancel, onCancel]);

  const handleNameChange = useCallback((evt) => setName(evt.target.value), [
    setName,
  ]);

  const handleSetDescription = useCallback(
    (evt) => setDescription(evt.target.value),
    [setDescription]
  );

  return (
    <Center canOverflow={true}>
      <form
        style={{ display: "inline-block", width: "100%", maxWidth: 500 }}
        onSubmit={handleSubmit}
      >
        <div className="note" style={{ marginBottom: 10 }}>
          User profiles are automatically generated by default. Changes here are
          saved to local storage.
        </div>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              width: 200,
              height: 200,
              display: "inline-block",
              border: "8px rgba(255,255,255,.4) solid",
              borderRadius: 200,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,.1)",
              color: "#000",
              fontSize: ".8rem",
            }}
          >
            <Center>
              {avatarURL && (
                // TODO: Move to Avatar component

                <Avatar src={avatarURL} name={name} size="100%" />
              )}
            </Center>
          </div>

          <div>
            <button onClick={generateAvatar}>
              Randomize <RandomIcon style={{ fontSize: "1.2rem" }} />
            </button>
          </div>
        </div>

        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "left" }}>
                <label>Name</label>
              </td>
              <td>
                <input
                  type="text"
                  style={{ width: "100%" }}
                  value={name}
                  onChange={handleNameChange}
                />
              </td>
              <td>
                <button onClick={generateName}>
                  <RandomIcon
                    style={{ fontSize: "1.2rem" }}
                    title="Random name"
                  />
                </button>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <div style={{ textAlign: "left" }}>
                  <div>
                    <label>Description</label>
                  </div>
                  <textarea
                    placeholder=""
                    style={{ width: "100%", height: 150 }}
                    value={description}
                    onChange={handleSetDescription}
                  ></textarea>
                </div>
              </td>
              <td style={{ verticalAlign: "bottom" }}>
                <button onClick={generateDescription}>
                  <RandomIcon
                    style={{ fontSize: "1.2rem" }}
                    title="Random description"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/*
          <div>
            <h2>Permissions</h2>
            <div style={{ display: "inline-block" }}>
              <label>Allow others to search for you</label>
              <br />
              <button disabled>Yes</button>
              <button>No</button>
            </div>
          </div>
          */}

        <div
          style={{
            marginTop: 20,
            textAlign: "right",
            overflow: "nowrap",
            paddingRight: 20,
          }}
        >
          <span className="note" style={{ color: isDirty ? "yellow" : null }}>
            Profile is {isDirty ? "not saved" : "saved"}
          </span>

          <div style={{ overflow: "nowrap", display: "inline-block" }}>
            <button
              onClick={handleCancel}
              style={{ marginLeft: 10, paddingRight: 20, paddingLeft: 20 }}
              // disabled={!isDirty}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "#347FE8",
                marginLeft: 10,
                paddingRight: 20,
                paddingLeft: 20,
              }}
              // disabled={!isDirty}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Center>
  );
}
