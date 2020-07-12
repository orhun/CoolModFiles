import React, { useState, useEffect, useRef } from "react";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function useKeyPress(targetKey) {
  // State for keeping track of whether key is pressed

  const [keyPressed, setKeyPressed] = useState(false);

  // If pressed key is our target key then set to true

  function downHandler({ key, keyCode }) {
    if (keyCode === 32 && targetKey === "space") {
      // todo: refactor this
      //  handle space
      setKeyPressed(true);
    }
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }

  // If released key is our target key then set to false

  const upHandler = ({ key, keyCode }) => {
    if (keyCode === 32 && targetKey === "space") {
      //  handle space
      setKeyPressed(false);
    }
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };

  // Add event listeners

  useEffect(() => {
    window.addEventListener("keydown", downHandler);

    window.addEventListener("keyup", upHandler);

    // Remove event listeners on cleanup

    return () => {
      window.removeEventListener("keydown", downHandler);

      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}

export { useInterval, useKeyPress };
