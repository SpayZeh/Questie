export const quests = [
  {
    id: 0,
    emoji: '🔴',
    tagline: "I'm Red",
    description: 'Take a selfie with something red in it.',
    color: '#FF3B30',
  },
  {
    id: 1,
    emoji: '🐶',
    tagline: 'Good Boy',
    description: 'Pet a dog and take a photo together.',
    color: '#FF9500',
  },
  {
    id: 2,
    emoji: '📞',
    tagline: 'Hey Mom',
    description: 'Call your mom and screenshot the call.',
    color: '#AF52DE',
  },
  {
    id: 3,
    emoji: '☀️',
    tagline: 'Golden Hour',
    description: 'Catch the sunset or sunrise light on camera.',
    color: '#FFCC00',
  },
  {
    id: 4,
    emoji: '🌿',
    tagline: 'Touch Grass',
    description: 'Go outside and photograph your hand on real grass.',
    color: '#34C759',
  },
  {
    id: 5,
    emoji: '☕',
    tagline: 'Cozy Corner',
    description: 'Make a warm drink and snap your coziest setup.',
    color: '#A2845E',
  },
  {
    id: 6,
    emoji: '🪞',
    tagline: 'Mirror Mirror',
    description: 'Find any mirror and take a classic mirror selfie.',
    color: '#5AC8FA',
  },
  {
    id: 7,
    emoji: '🍕',
    tagline: "Today's Meal",
    description: 'Photograph whatever you are eating right now.',
    color: '#FF6B35',
  },
  {
    id: 8,
    emoji: '🌧️',
    tagline: 'Rain Dance',
    description: 'Find rain — real or imagined — and dance in it.',
    color: '#007AFF',
  },
  {
    id: 9,
    emoji: '📚',
    tagline: 'On My Shelf',
    description: 'Show us what you are reading or your bookshelf.',
    color: '#FF2D55',
  },
];

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

export function getTodaysQuest() {
  return quests[getDayOfYear(new Date()) % quests.length];
}

export function getNextQuest() {
  const i = getDayOfYear(new Date()) % quests.length;
  return quests[(i + 1) % quests.length];
}
