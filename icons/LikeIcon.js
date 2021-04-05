import * as React from "react";

// <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
// 	 width="437.775px" height="437.774px" viewBox="0 0 437.775 437.774" style="enable-background:new 0 0 437.775 437.774;"
// 	 xml:space="preserve">
//   <g>
//   	<path d="M316.722,29.761c66.852,0,121.053,54.202,121.053,121.041c0,110.478-218.893,257.212-218.893,257.212S0,266.569,0,150.801
//   		C0,67.584,54.202,29.761,121.041,29.761c40.262,0,75.827,19.745,97.841,49.976C240.899,49.506,276.47,29.761,316.722,29.761z"/>
//   </g>

// </svg>

function LikeButton(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 30 30" fill="none" {...props}>
      <path
        d="m21.33099,3c4.39419,0 7.95683,3.5627 7.95683,7.95604c0,7.26173 -14.38786,16.90657 -14.38786,16.90657s-14.38714,-9.29719 -14.38714,-16.90664c0,-5.46986 3.5627,-7.95597 7.95604,-7.95597c2.64643,0 4.98412,1.29784 6.4311,3.28493c1.44718,-1.98709 3.78526,-3.28493 6.43103,-3.28493z"
        fill="url(#like_svg__paint1_linear)"
      />
      <defs>
        <linearGradient
          id="like_svg__paint0_linear"
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
          id="like_svg__paint1_linear"
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

export default LikeButton;

