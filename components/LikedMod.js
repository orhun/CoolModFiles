import React from "react";
import styles from "./LikedMods.module.scss";

function LikedMod({
  track,
  index,
  setTrackId,
  playMusic,
  removeFavoriteModRuntime,
}) {
  const playLikedMod = () => {
    setTrackId(track.id);
    playMusic(track.id);
  };

  return (
    <li className={styles.likedMod} key={index}>
      <div
        id={`liked_mod_${track.id}`}
        onClick={() => playLikedMod(track.id, index)}
        title={
          `#${track.id}`
          + ` - ${track.artist || "[No Artist]"}`
          + ` - ${track.title || "[No Title]"}`
        }
      >
        {track.title || `#${track.id}`}
      </div>
      <div
        id={`removes_${track.id}`}
        onClick={() => removeFavoriteModRuntime(track.id, index)}
      >
        x
      </div>
    </li>
  );
}

export default LikedMod;
