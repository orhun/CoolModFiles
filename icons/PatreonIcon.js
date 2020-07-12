import * as React from "react";

function SvgPatreon(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 40 39" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.032 0H0v38.333h7.032V0zm4.201 14.388C11.233 6.455 17.695 0 25.64 0 33.562 0 40 6.457 40 14.388c0 7.909-6.437 14.35-14.36 14.35-7.945 0-14.407-6.433-14.407-14.35z"
        fill="url(#patreon_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="patreon_svg__paint0_linear"
          x1={40}
          y1={0}
          x2={0}
          y2={38}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgPatreon;

