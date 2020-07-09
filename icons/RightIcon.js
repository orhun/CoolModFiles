import * as React from "react";

function SvgRight(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80 40c0 22.091-17.909 40-40 40S0 62.091 0 40 17.909 0 40 0s40 17.909 40 40zM46.803 25.578h5.442v28.3h-5.442V42.87L27.755 53.867V25.59l19.048 10.997V25.578z"
        fill="#BD00FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80 40c0 22.091-17.909 40-40 40S0 62.091 0 40 17.909 0 40 0s40 17.909 40 40zM46.803 25.578h5.442v28.3h-5.442V42.87L27.755 53.867V25.59l19.048 10.997V25.578z"
        fill="url(#right_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="right_svg__paint0_linear"
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

export default SvgRight;

