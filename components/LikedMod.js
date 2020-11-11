import React from "react";
import styles from "./LikedMods.module.scss";

function LikedMod({ trackId, index }) {
    return (
      <li class={styles.likedMod} key={index}>
        <div id={`liked_mod_${trackId}`}>{trackId}</div>
        <div id={`removes_${trackId}`}>x</div>
      </li>
    );
 
}

export default LikedMod;

