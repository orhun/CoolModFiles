import React from "react";
import styles from "./LikedMods.module.scss";

function LikedMods({ content }) {

  if (!content.length) {      
    return (  
      <ol>
        <li>Add some cool stuff here!</li>
      </ol>
    )
  }
  else{
    return (      
        <ol>
          {content.map((item, index) => (
            <li key={index}>
              {content[index]}
              <a href="#">x</a>
            </li>
        ))}
        </ol>
      )
  }
}

export default LikedMods;

