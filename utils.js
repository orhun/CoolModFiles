const RANDOM_MAX = 189573;

const BG_IMAGES = [
  "bg_1.jpg",
  "bg_2.png",
  "bg_3.jpg",
  "bg_4.jpg",
  "bg_5.jpg",
  "bg_6.jpg",
  "bg_7.png",
  "bg_8.jpg",
  "bg_9.jpg",
  "bg_10.jpg",
]

const MESSAGES = [
  "Give me random song!",
  "Can I get... uhhh...",
  "Pass the mods, babe!",
  "Entertain me!",
  "Shoot one!",
  "Let's dance!",
  "Play a new random mod file.",
  "Roll next.",
  "playRandom();",
  "Gib song.",
  "Where the mods at?",
  "The party must go on!",
  "Click me.",
  "Any mods online?",
  "Move it! / Let's move it!",
  "Crank it up, mate!",
  "=music play",
  "JMP playmod",
  "CLICK HERE TO CLAIM YOUR FREE RANDOM MOD!",
  "Rumor says you can play mods here.",
  "I would like to get one mod file, please.",
  "In the mood for a mod!",
  "Wanna see my mods?",
  "Can I get some?",
  "Mod pls",
  "Drop the beats!",
  "And the next song is...",
  "It's a bird! It's a plane! It's...",
  "Unleash the wonders!",
  "Just play it already.",
  "Let the modules hit the floor!",
  "Play sth nice!",
  "Let's roll!",
  "Stop refreshing, just click me!",
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
  "HAI, CAN HAZ SONG?",
  "What if we listened to a cool mod file together? Haha, just kidding! Unless...",
  "Hello world.",
  "That's so sad Alexa, play a mod.",
  "Kowalski, module.",
  "ALL YOUR MOD ARE BELONG TO US",
  "Tell me, Mr. Anderson, what good is a mod archive if you are unable to choose?",
  "When life gives you lemons, play a mod file!",
  "/playsound module",
  "/tableflip",
  "oturmaya mi geldik?"
]

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { getRandomInt, getRandomFromArray, RANDOM_MAX,
  MESSAGES, EE_MESSAGES, BG_IMAGES };
