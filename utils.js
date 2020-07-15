const RANDOM_MAX = 189623;

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
];

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
  "Move it!",
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
];

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
  "oturmaya mi geldik?",
];

const SHARE_MESSAGES = [
  "Check this out:",
  "Look what I've found:",
  "Here's a cool track:",
  "Simply wonderful.",
  "Listen to this!",
  "Don't miss this!",
  "Cool mod:",
  "Loved it!",
  "You have to see this one:",
  "This one is my favorite!",
  "Kinda liked it.",
  "Such an amazing track!",
  "Have this on loop right now.",
  "Good one:",
  "Cool vibes:",
  "Addicting:",
  "It's alright, I guess...",
  "Nice stuff:",
  "Underrated:",
  "Add this to your playlist!",
  "EPIC.",
  "Best track ever.",
  "If this isn't the coolest thing ever, I don't know what is:",
  "Magical!",
  "Incredible track!",
  "This is art:",
  "Can't stop listening!",
  "10/10",
  "I've found the perfect track.",
  "You might enjoy this:",
  "I wish it was longer:",
  "Have some of this!",
  "DAYUM!",
  "Slaps hard:",
  "Out of this world:",
  "Impressive.",
  "Wow!",
  "OMG!",
];

const MOBILE_MESSAGES = [
  "Player is not working stable on mobile, sorry :(",
  "Sorry, mobile devices aren't supported. But I won't stop you...",
  "Mobile devices are not fully supported. Sorry for the inconvenience.",
  "The mobile version may be broken.",
  "Please try not to use mobile devices, they frighten the mods.",
  "We usually don't serve mobile devices here.",
  "Mobile devices ain't supported dogg",
  "Someone stole our mobile support. Can't have s**t in Detroit.",
  "No one told you that we don't support mobile, eh?",
  "Mobile player went belly up. Don't enable the desktop site.",
  "Unfortunately, our mobile support isn't top-notch. I would suggest that you try a desktop browser instead.",
  "Get off your phone, PC master race!",
  "We support no phones, no tablets, no nothin'; just so you know... Only desktop.",
  "You could as well just try playing it on a refrigerator... We only support desktop, duh.",
  "Mobile devices are a big no no.",
  "Nope. No mobile support. Sorry. If you choose to continue, you are on your own.",
  "Just because it runs DOOM doesn't mean your mobile device will handle this player. Consider switching to a proper desktop.",
  "On the Emperor's orders, we can't let mobile devices in; but I guess I could pretend not to see you...",
  "No mobile support. I don't make the rules here.",
  "Try using desktop, you will love it.",
  "Mobile bad, desktop good.",
  "We don't like your kind here. Go get a desktop.",
  "Wait, there is no mobile support? WHAT!?",
];

function generateEmbedString(id, title) {
  return `<iframe
  width="100%"
  height="200"
  src="${process.env.DOMAIN}/embed/${id}?title=${title}"
  frameborder="0"
></iframe>`;
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
  getRandomInt,
  getRandomFromArray,
  generateEmbedString,
  RANDOM_MAX,
  BG_IMAGES,
  MESSAGES,
  EE_MESSAGES,
  SHARE_MESSAGES,
  MOBILE_MESSAGES,
};
