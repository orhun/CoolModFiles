import * as React from "react";

function SvgArrow(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 52 18" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.26.416L0 15l1.5 2.598L25.74 3.603l24.24 13.995L51.48 15 26.222.416 25.981 0l-.24.139L25.5 0l-.24.416z"
        fill="#BD00FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.26.416L0 15l1.5 2.598L25.74 3.603l24.24 13.995L51.48 15 26.222.416 25.981 0l-.24.139L25.5 0l-.24.416z"
        fill="url(#arrow_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="arrow_svg__paint0_linear"
          x1={49}
          y1={15}
          x2={4.5}
          y2={13.5}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B8FF" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgArrow;

