import React from "react";
import styles from "./LikedMods.module.scss";

function LikedMod({ trackId, index, playMusic, removeFavoriteModRuntime }) {
  const playLikedMod = () => {
    playMusic(trackId.replace("#", ""));
  };
  const removeLikedMod = () => {
    removeFavoriteModRuntime(trackId);
  };

  return (
    <li className={styles.likedMod} key={index}>
      <div
        id={`liked_mod_${trackId}`}
        onClick={() => playLikedMod(trackId, index)}
      >
        {trackId}
      </div>
      <div
        id={`removes_${trackId}`}
        onClick={() => removeLikedMod(trackId, index)}
      >
        x
      </div>
    </li>
  );
}

export default LikedMod;

