import * as React from "react";

function SvgDownload(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 30 30" fill="none" {...props}>
      <path
        d="M16.5 1.5a1.5 1.5 0 00-3 0v14.379l-4.94-4.94a1.5 1.5 0 00-2.12 2.122l7.498 7.499.011.01a1.495 1.495 0 001.046.43h.01a1.495 1.495 0 001.046-.43l.01-.01 7.5-7.5a1.5 1.5 0 00-2.122-2.12L16.5 15.878V1.5z"
        fill="url(#download_svg__paint0_linear)"
      />
      <path
        d="M1.5 18A1.5 1.5 0 013 19.5v6A1.5 1.5 0 004.5 27h21a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 013 0v6a4.5 4.5 0 01-4.5 4.5h-21A4.5 4.5 0 010 25.5v-6A1.5 1.5 0 011.5 18z"
        fill="url(#download_svg__paint1_linear)"
      />
      <defs>
        <linearGradient
          id="download_svg__paint0_linear"
          x1={16}
          y1={29.5}
          x2={16.5}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={0.995} stopColor="#00B8FF" />
        </linearGradient>
        <linearGradient
          id="download_svg__paint1_linear"
          x1={16}
          y1={29.5}
          x2={16.5}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={0.995} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgDownload;

