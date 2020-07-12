import * as React from "react";

function SvgCode(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 22 14" fill="none" {...props}>
      <path
        d="M7.707 1.707A1 1 0 006.293.293l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414-1.414L2.414 7l5.293-5.293z"
        fill="url(#code_svg__paint0_linear)"
      />
      <path
        d="M15.707.293a1 1 0 10-1.414 1.414L19.586 7l-5.293 5.293a1 1 0 001.414 1.414l6-6a1 1 0 000-1.414l-6-6z"
        fill="url(#code_svg__paint1_linear)"
      />
      <defs>
        <linearGradient
          id="code_svg__paint0_linear"
          x1={22}
          y1={-1}
          x2={0}
          y2={14}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
        <linearGradient
          id="code_svg__paint1_linear"
          x1={22}
          y1={-1}
          x2={0}
          y2={14}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgCode;

