import React from "react"
import styles from "./PlayerBig.module.scss";

function LoadingState() {
  return (
    <ul className={styles.metadata}>
      <li>███████</li>
      <li>██████████████</li>
      <li>█████████████████</li>
    </ul>
  );
}

export default LoadingState;