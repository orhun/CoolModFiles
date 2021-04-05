import React from "react";
import styles from "./LikedMods.module.scss";
import LikedMod from "./LikedMod"

function LikedMods({ content, playMusic, removeFavoriteModRuntime }) {
  if (!content.length) {
    return (
      <ol>
        <li>Add some cool stuff here!</li>
      </ol>
    );
  } else {
    return (
      <ol>
        {content.map((trackId, index) => (
          <LikedMod
            trackId={trackId}
            index={index}
            playMusic={playMusic}
            removeFavoriteModRuntime={removeFavoriteModRuntime}
            onClick={() => playLikedMod(trackId, index)}
            key={index}
          ></LikedMod>
        ))}
      </ol>
    );
  }
}

export default LikedMods;

