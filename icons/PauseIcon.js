import * as React from "react";

function SvgPause(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 130 130" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M130 65c0 35.898-29.102 65-65 65-35.898 0-65-29.102-65-65C0 29.102 29.102 0 65 0c35.898 0 65 29.102 65 65zM45 40h15v50H45V40zm25 0h15v50H70V40z"
        fill="#BD00FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M130 65c0 35.898-29.102 65-65 65-35.898 0-65-29.102-65-65C0 29.102 29.102 0 65 0c35.898 0 65 29.102 65 65zM45 40h15v50H45V40zm25 0h15v50H70V40z"
        fill="url(#pause_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="pause_svg__paint0_linear"
          x1={20.5}
          y1={2}
          x2={126.5}
          y2={115.5}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B8FF" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgPause;

