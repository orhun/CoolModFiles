var player;
let tick;
const RANDOM_MAX = 189573;
function initializePlayer() {
    if (player === undefined) {
      player = new ChiptuneJsPlayer(new ChiptuneJsConfig(-1));
    } else {
      player.stop();
    }
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
libopenmpt.onRuntimeInitialized = function () {
  document.getElementById("btnPlay").addEventListener("click", function (e) {
    initializePlayer();
    player.load(`jsplayer.php?moduleid=${getRandomInt(0, RANDOM_MAX)}`, function (
      buffer
    ) {
      player.play(buffer);
      document
        .getElementById("seekbar")
        .setAttribute("max", player.duration());
      tick = setInterval(() => {
        document.getElementById("seekbar").value = player.getPosition();
      }, 500);
    });
  });
};