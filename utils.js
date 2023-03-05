import { toast } from "react-toastify";

const RANDOM_MAX = 190580;

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
  "bg_11.jpg",
  "bg_12.jpg",
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
  "Why so silent?",
  "You want to click here.",
  "Hit me!",
  "Try me!",
  "Looking to spend some quality time?",
  "The mod player's this way, sir.",
  "Is this the mod player?",
  "Here are today's tunes for you.",
  "Make some noise!",
  "Music time!",
  "Sonificate my mind!",
  "Need some retro in your life?",
  "Click here. You won't regret it.",
];

const EE_MESSAGES = [
  "bom HInob.",
  "ivegay emay ayay ongsay.",
  "xyzzy",
  "Open the mod bay doors, HAL",
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
  "CLICK HERE TO CLAIM YOUR FREE RANDOM MOD!",
  "This click is going to cost us 51 years...",
  "I'm going to find you a module you can't refuse.",
  "Keep your tracker close, but your modules closer.",
  "It's a track!",
  "Access the secret mod vault!",
  "We are here to share music and wisdom, and we are all out of wisdom...",
  "Replace this text before deployment.",
  "Lorem ipsum dolor sit amet",
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

const REFRESH_MESSAGES = [
  "What a nice weather to listen to the music today.",
  "A newcomer?",
  "I think I have seen you somewhere before.",
  "Come and join us!",
  "Finally!",
  "Let's get this party started!",
  "How about a new song?",
  "NOT ERROR 404, you found it!",
  "Let's do this!",
  "Put your seatbelt on, we are just starting!",
  "Let's make this fun.",
  "Those who wish to sing always find a song.",
  "Pain is temporary, music is eternal",
  "You only have to click once, fool.",
  "One, two, three, four!",
  "Are you going to listen?",
  "New track?",
  "Why are you refreshing?",
  "Where words fail, music speaks.",
  "Understandable. Have a nice day!",
  "Music is the strongest form of magic.",
  "Getting bored? Just find a new one!",
  "Just take a seat, the show is about to begin",
  "Beats. Beats. Beats.",
];

const MOBILE_MESSAGES = [
  "Player is not entirely stable on mobile, sorry :(",
  "Whoa, easy there bud, we weren't expecting mobile devices. Though you made it this far... You can try your luck.",
  "We didn't order mobile devices, maybe it was the website next door... Well, we can take you in for once.",
  "Sorry, mobile devices aren't supported, really. But I won't stop you.",
  "Mobile devices are not fully supported. Sorry for any possible inconvenience in advance.",
  "The mobile version may be broken. Or it may not be. But then again, it probably is.",
  "Please try not to use mobile devices, they frighten the mods.",
  "We usually don't serve mobile devices here, but we have made exceptions before. Just don't tell anyone else.",
  "Mobile devices ain't supported dogg; but if you gotta try, you gotta try, you know what I'm sayin'?",
  "Someone stole our mobile support. Can't have s**t in Detroit.",
  "No one told you that we don't support mobile, eh? But I guess we can't send you back right away either. Come on in, just for this once.",
  "Mobile player goes belly up sometimes. Don't enable the desktop site.",
  "Unfortunately, our mobile support isn't always top-notch. I would suggest that you try a desktop browser instead.",
  "Get off your phone, PC master race! (Tap me to proceed.)",
  "We support no phones, no tablets, no nothin'; just so you know... Only desktop. If you go ahead, you are on your own.",
  "You could as well just try playing it on a refrigerator... We only support desktop, duh. (If it does work on a refrigerator, let us know.)",
  "Mobile devices are a big no no... most of the time anyway. Maybe yours is different.",
  "Nope. No mobile support. Sorry. If you choose to continue, don't come crying back to us later.",
  "Just because it runs DOOM doesn't mean your mobile device will handle this player. Consider switching to a desktop.",
  "On the Emperor's orders, we can't let mobile devices in; but I guess I could pretend not to see you...",
  "No mobile support. I don't make the rules here... but thinking about it, I don't really enforce them either.",
  "Try using desktop, you will love it.",
  "Mobile bad, desktop good. That's not me saying it, that's the website.",
  "We don't like your kind here. Go get a desktop.",
  "Wait, there is no mobile support? WHAT!?",
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmbedString(id, title) {
  return `<iframe
  width="100%"
  height="200"
  src="${process.env.DOMAIN}/embed/${id}?title=${encodeURIComponent(title)}"
  frameborder="0"
></iframe>`;
}

function showToast(msg) {
  toast.dark(msg, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    closeButton: false,
  });
}

export {
  getRandomInt,
  getRandomFromArray,
  generateEmbedString,
  showToast,
  RANDOM_MAX,
  BG_IMAGES,
  MESSAGES,
  EE_MESSAGES,
  SHARE_MESSAGES,
  MOBILE_MESSAGES,
  REFRESH_MESSAGES,
};
