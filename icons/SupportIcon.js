import * as React from "react";

function SvgSupport(props) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 30 30" fill="none" {...props}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 15.3783C0 6.88487 6.7155 0 15 0C23.2845 0 30 6.88487 30 15.3783C30 22.2117 25.6493 27.997 19.635 30H17.2953C18.5583 30 19.7823 29.5822 20.7979 28.8096L26.2928 24.6184C27.0654 24.0299 27.2303 22.9068 26.6617 22.1072C26.0931 21.3076 25.0081 21.1369 24.2355 21.7254L19.0401 25.6875H13.8057C13.4237 25.6875 13.1112 25.3641 13.1112 24.9688C13.1112 24.5734 13.4237 24.25 13.8057 24.25H14.5001H17.2779C18.0462 24.25 18.6668 23.6076 18.6668 22.8125C18.6668 22.0174 18.0462 21.375 17.2779 21.375H14.5001H13.8057H10.4072C9.14418 21.375 7.9202 21.8152 6.93495 22.6328L4.98614 24.25H3.3889C3.19131 24.25 3.00348 24.2925 2.83347 24.3692C1.05081 21.8417 0 18.7366 0 15.3783ZM11.7484 7C9.91241 7 8.42368 8.54082 8.42368 10.441C8.42368 11.3529 8.77525 12.2289 9.39591 12.8713L13.8838 17.5162C14.2224 17.8666 14.7736 17.8666 15.1121 17.5162L19.6044 12.8713C20.225 12.2289 20.5766 11.3529 20.5766 10.441C20.5766 8.54082 19.0879 7 17.2519 7C16.3708 7 15.5245 7.36387 14.9038 8.00625L14.5001 8.42402L14.0965 8.00625C13.4758 7.36387 12.6295 7 11.7484 7Z"
        fill="url(#paint0_linear_818_87)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_818_87"
          x1="1.875"
          y1="26.5276"
          x2="29.0056"
          y2="5.65518"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00B8FF" />
          <stop offset="1" stop-color="#BD00FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SvgSupport;