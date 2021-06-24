import React from "react";
import styles from "./LikedMods.module.scss";
import LikedMod from "./LikedMod";

function LikedMods({
  content,
  setTrackId,
  playMusic,
  removeFavoriteModRuntime,
}) {
  if (!content.length) {
    return (
      <ol>
        <li>Add some cool mod files here!</li>
      </ol>
    );
  } else {
    return (
      <ol>
        {content.map((track, index) => (
          <LikedMod
            track={track}
            index={index}
            setTrackId={setTrackId}
            playMusic={playMusic}
            removeFavoriteModRuntime={removeFavoriteModRuntime}
            key={index}
          />
        ))}
      </ol>
    );
  }
}

export default LikedMods;
