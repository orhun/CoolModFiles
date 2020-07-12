import * as React from "react";

function SvgClip(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 18 22" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0a2 2 0 00-2 2H3a3 3 0 00-3 3v14a3 3 0 003 3h12a3 3 0 003-3V5a3 3 0 00-3-3h-1a2 2 0 00-2-2H6zm8 4a2 2 0 01-2 2H6a2 2 0 01-2-2H3a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-1zM6 4h6V2H6v2z"
        fill="url(#clip_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="clip_svg__paint0_linear"
          x1={18}
          y1={0}
          x2={0}
          y2={22}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgClip;

