import * as React from "react";

function SvgQuestion(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 36 36" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.875 2.75C9.522 2.75 2.75 9.522 2.75 17.875S9.522 33 17.875 33 33 26.228 33 17.875 26.228 2.75 17.875 2.75zM0 17.875C0 8.003 8.003 0 17.875 0S35.75 8.003 35.75 17.875 27.747 35.75 17.875 35.75 0 27.747 0 17.875zm17.875 7.792c.76 0 1.375.615 1.375 1.375v.018a1.375 1.375 0 11-2.75 0v-.018c0-.76.616-1.375 1.375-1.375zm.148-18.386a6.142 6.142 0 00-4.91 2.43 1.375 1.375 0 102.19 1.662 3.392 3.392 0 113.928 5.212 4.125 4.125 0 00-2.729 4.118 1.375 1.375 0 002.746-.156 1.375 1.375 0 01.951-1.388 6.141 6.141 0 00-2.176-11.878z"
        fill="url(#Question_svg__paint0_linear)"
      />
      <defs>
        <linearGradient
          id="Question_svg__paint0_linear"
          x1={30}
          y1={3}
          x2={6}
          y2={32}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BD00FF" />
          <stop offset={1} stopColor="#00B8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgQuestion;

