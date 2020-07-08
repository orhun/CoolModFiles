const BG_IMAGES = [
  "bg_1.jpg",
  "bg_2.png",
  "bg_3.jpg",
  "bg_4.jpg",
  "bg_5.jpg",
]

const MESSAGES = [
  "Give me random song!",
  "Can I get uhhh...",
  "Pass the mods, babe!",
  "Entertain me!",
  "Shoot one!",
  "Let's dance!",
]

const EE_MESSAGES = [
  "bom HInob.",
  "ivegay emay ayay ongsay.",
  "xyzzy",
  "open the pod bay doors",
  "42",
  "1337",
  "rm -rf",
  "apt-get moo",
  "sudo give me a song",
  "beam me up, mr. scott!",
  "PApus33bRMI"
]

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { getRandomInt, getRandomFromArray, MESSAGES, EE_MESSAGES, BG_IMAGES };
