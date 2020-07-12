import React from "react";

import styles from "./Footer.module.scss";
import { TwitterIcon, GithubIcon, PatreonIcon } from "../icons";

function Footer() {
  return (
    <footer className={styles.footer}>
      <a href="https://twitter.com/CoolModFiles" target="_blank">
        <TwitterIcon height="40" width="40" />
      </a>
      <a href="https://github.com/orhun/CoolModFiles" target="_blank">
        <GithubIcon height="40" width="40" />
      </a>
      <a href="https://www.patreon.com/orhunp" target="_blank">
        <PatreonIcon height="40" width="40" />
      </a>
    </footer>
  );
}

export default Footer;
