import * as React from "react";

function SvgRepeat(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 33 36" fill="none" {...props}>
      <path
        d="M26.18.403a1.375 1.375 0 10-1.944 1.944L27.39 5.5H6.875A6.875 6.875 0 000 12.375v5.5a1.375 1.375 0 102.75 0v-5.5A4.125 4.125 0 016.875 8.25h20.514l-3.153 3.153a1.375 1.375 0 001.945 1.944l5.5-5.5a1.375 1.375 0 000-1.944l-5.5-5.5z"
        fill="url(#repeat_svg__paint0_linear)"
      />
      <path
        d="M32.083 17.875a1.375 1.375 0 10-2.75 0v5.5a4.125 4.125 0 01-4.125 4.125H4.695l3.152-3.153a1.375 1.375 0 00-1.944-1.944l-5.5 5.5a1.375 1.375 0 000 1.944l5.5 5.5a1.375 1.375 0 001.944-1.944L4.695 30.25h20.513a6.875 6.875 0 006.875-6.875v-5.5z"
        fill="url(#repeat_svg__paint1_linear)"
      />
      <defs>
        <linearGradient
          id="repeat_svg__paint0_linear"
          x1={32}
          y1={0}
          x2={-1.5}
          y2={36}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
        <linearGradient
          id="repeat_svg__paint1_linear"
          x1={32}
          y1={0}
          x2={-1.5}
          y2={36}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgRepeat;

