import * as React from "react";

function SvgLeft(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80 40c0 22.091-17.909 40-40 40S0 62.091 0 40 17.909 0 40 0s40 17.909 40 40zM33.197 25.578h-5.442v28.3h5.442V42.87l19.048 10.997V25.59L33.197 36.586V25.578z"
        fill="#BD00FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80 40c0 22.091-17.909 40-40 40S0 62.091 0 40 17.909 0 40 0s40 17.909 40 40zM33.197 25.578h-5.442v28.3h5.442V42.87l19.048 10.997V25.59L33.197 36.586V25.578z"
        fill="url(#left_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="left_svg__paint0_linear"
          x1={12.615}
          y1={1.231}
          x2={77.846}
          y2={71.077}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B8FF" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgLeft;

