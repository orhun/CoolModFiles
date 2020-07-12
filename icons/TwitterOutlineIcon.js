import * as React from "react";

function SvgVector(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 20" fill="none" {...props}>
      <path
        d="M23 1.01a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1a10.66 10.66 0 01-9-4.53s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83A7.72 7.72 0 0023 1.01v0z"
        stroke="url(#Vector_svg__paint0_linear)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="Vector_svg__paint0_linear"
          x1={23}
          y1={-1.49}
          x2={1}
          y2={21.01}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.011} stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgVector;

