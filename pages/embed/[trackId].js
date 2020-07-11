import React from "react";
import { useRouter } from "next/router";

import EmbedPlayer from "../../components/embed/EmbedPlayer";

function Embed() {
  const router = useRouter();
  console.log(router.query);
  return (
    <EmbedPlayer
      sharedTrackId={router.query.trackId}
      sharedTitle={router.query.title}
    />
  );
}

Embed.type = "Embed";

export default Embed;
