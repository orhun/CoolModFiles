import React from "react";

import styles from "./Footer.module.scss";
import { TwitterIcon, GithubIcon } from "../icons";

function Footer() {
  return (
    <footer className={styles.footer}>
      <TwitterIcon height="40" width="40" />
      <GithubIcon height="40" width="40" />
    </footer>
  );
}

export default Footer;
