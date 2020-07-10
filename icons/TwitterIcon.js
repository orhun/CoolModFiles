import * as React from "react";

function SvgTwitter(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 36 30" fill="none" {...props}>
      <path
        d="M35.42 4.183a14.633 14.633 0 01-4.148 1.135 7.208 7.208 0 003.176-3.965 14.495 14.495 0 01-4.585 1.735A7.21 7.21 0 0024.602.833c-3.986 0-7.218 3.203-7.218 7.152 0 .56.066 1.103.189 1.632A20.565 20.565 0 012.698 2.138a7.068 7.068 0 00-.976 3.602c0 2.482 1.27 4.668 3.209 5.956a7.332 7.332 0 01-3.272-.893v.084c0 3.469 2.488 6.358 5.787 7.015a7.181 7.181 0 01-1.897.257c-.466 0-.92-.052-1.36-.131.918 2.835 3.583 4.907 6.74 4.969a14.582 14.582 0 01-8.964 3.061c-.584 0-1.156-.033-1.72-.101a20.625 20.625 0 0011.064 3.21c13.273 0 20.534-10.9 20.534-20.355 0-.31-.01-.619-.024-.924 1.417-1 2.638-2.262 3.602-3.705z"
        fill="url(#twitter_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="twitter_svg__paint0_linear"
          x1={0}
          y1={26}
          x2={34}
          y2={1}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B8FF" />
          <stop offset={1} stopColor="#BD00FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgTwitter;

