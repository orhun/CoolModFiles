import * as React from "react";

function SvgPlay(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 130 130" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M65 130c35.898 0 65-29.102 65-65 0-35.898-29.102-65-65-65C29.102 0 0 29.102 0 65c0 35.898 29.102 65 65 65zM52.5 86.65L90 65 52.5 43.35v43.3z"
        fill="#BD00FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M65 130c35.898 0 65-29.102 65-65 0-35.898-29.102-65-65-65C29.102 0 0 29.102 0 65c0 35.898 29.102 65 65 65zM52.5 86.65L90 65 52.5 43.35v43.3z"
        fill="url(#play_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="play_svg__paint0_linear"
          x1={8}
          y1={6.5}
          x2={114}
          y2={120}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B8FF" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgPlay;

