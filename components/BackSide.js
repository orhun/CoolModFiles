import React from "react";
import Markdown from "markdown-to-jsx";

import styles from "./BackSide.module.scss";

function BackSide({ content }) {
  return (
    <Markdown
      options={{
        forceBlock: true,
        overrides: {
          p: {
            props: {
              className: styles.p
            }
          },
          h2: {
            props: {
              className: styles.h2,
            },
          },
          a: {
            props: {
              className: styles.a,
              target: "_blank",
            },
          },
          table: {
            props: {
              className: styles.table,
            },
          },
          code: {
            props: {
              className: styles.code,
            },
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
}

export default BackSide;
