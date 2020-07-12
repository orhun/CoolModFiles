import * as React from "react";

function SvgArrowSimple(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.707.293a1 1 0 00-1.414 1.414L12.586 7H1a1 1 0 000 2h11.586l-5.293 5.293a1 1 0 101.414 1.414l7-7 .007-.006A.997.997 0 0016 8.003V8v-.003a.996.996 0 00-.286-.698l-.008-.007m-6.999-7l7 7z"
        fill="url(#ArrowSimple_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="ArrowSimple_svg__paint0_linear"
          x1={16}
          y1={8}
          x2={0}
          y2={8}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgArrowSimple;

