import * as React from "react";

function SvgShare(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 22" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.158 6.815a4 4 0 10-1.008-1.727L6.842 8.185a4 4 0 100 5.63l5.309 3.093A4.003 4.003 0 0016 22a4 4 0 10-2.839-6.818l-5.31-3.095a4.004 4.004 0 000-2.175l5.307-3.097zM16 2a2 2 0 100 4 2 2 0 000-4zM5.7 9.945a1.009 1.009 0 00.056.097c.156.284.244.61.244.958a1.991 1.991 0 01-.3 1.055 2 2 0 110-2.11zM14 18c0-.325.078-.632.215-.904a1.01 1.01 0 00.123-.208A2 2 0 1114 18z"
        fill="url(#share_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="share_svg__paint0_linear"
          x1={20.5}
          y1={0}
          x2={0}
          y2={21}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgShare;

