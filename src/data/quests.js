export const quests = [
  {
    id: 0,
    emoji: '🔴',
    title: 'Take a selfie with something RED',
    description: 'Find anything red nearby — a shirt, a mug, a stop sign — and snap a pic with it!',
    color: '#FF3B30',
    colorLight: '#FFF0EF',
    colorMid: '#FFD5D3',
    completions: 14823,
  },
  {
    id: 1,
    emoji: '🐶',
    title: 'Pet a dog and take a selfie',
    description: 'Spot a good boy (or girl!) and get that sweet selfie. Permission from the owner required!',
    color: '#FF9500',
    colorLight: '#FFF5E6',
    colorMid: '#FFE5B8',
    completions: 9241,
  },
  {
    id: 2,
    emoji: '📞',
    title: 'Call your mom and screenshot it',
    description: "Ring ring! Give your mom a call and screenshot the moment. She'll love it.",
    color: '#AF52DE',
    colorLight: '#F7F0FF',
    colorMid: '#E8D0FF',
    completions: 21037,
  },
  {
    id: 3,
    emoji: '☀️',
    title: 'Catch the golden hour',
    description: "Head outside during sunset or sunrise and capture that gorgeous golden light.",
    color: '#FFCC00',
    colorLight: '#FFFDE6',
    colorMid: '#FFF5A8',
    completions: 18654,
  },
  {
    id: 4,
    emoji: '🌿',
    title: 'Touch grass (literally)',
    description: 'Go outside, find some real grass, and take a photo of your hand touching it. Classic.',
    color: '#34C759',
    colorLight: '#EDFFF2',
    colorMid: '#C0F0CF',
    completions: 11290,
  },
  {
    id: 5,
    emoji: '☕',
    title: 'Recreate a coffee shop vibe',
    description: 'Make a warm drink, find a cozy spot, and snap your most aesthetic setup.',
    color: '#A2845E',
    colorLight: '#FDF6EE',
    colorMid: '#EDD9BE',
    completions: 16782,
  },
  {
    id: 6,
    emoji: '🪞',
    title: 'Mirror selfie, no excuses',
    description: 'Find any mirror and take a classic mirror selfie. Points for creativity!',
    color: '#5AC8FA',
    colorLight: '#EAF8FF',
    colorMid: '#BDE9FF',
    completions: 24501,
  },
  {
    id: 7,
    emoji: '🍕',
    title: 'Eat something delicious',
    description: "Whatever you're having for a meal today — snap it and share the yum.",
    color: '#FF6B35',
    colorLight: '#FFF2ED',
    colorMid: '#FFD5BF',
    completions: 31204,
  },
  {
    id: 8,
    emoji: '🌧️',
    title: 'Dance in the rain (or pretend to)',
    description: "Real rain? Amazing. No rain? Grab a spray bottle. We won't judge.",
    color: '#007AFF',
    colorLight: '#EAF3FF',
    colorMid: '#BDDAFF',
    completions: 7843,
  },
  {
    id: 9,
    emoji: '📚',
    title: 'Show us your bookshelf',
    description: "Real books, ebooks, or even one single book counts. Show what you're reading!",
    color: '#FF2D55',
    colorLight: '#FFF0F3',
    colorMid: '#FFD0D8',
    completions: 13567,
  },
];

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getTodaysQuest() {
  const today = new Date();
  const dayIndex = getDayOfYear(today) % quests.length;
  return quests[dayIndex];
}

export function getNextQuest() {
  const today = new Date();
  const dayIndex = getDayOfYear(today) % quests.length;
  return quests[(dayIndex + 1) % quests.length];
}

export function getPastQuests() {
  const today = new Date();
  const dayIndex = getDayOfYear(today) % quests.length;
  const past = [];
  for (let i = 1; i <= 3; i++) {
    const idx = (dayIndex - i + quests.length) % quests.length;
    past.push(quests[idx]);
  }
  return past;
}
