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

// CET = UTC+1. We use a fixed offset (CEST is UTC+2 but fixed +1 is close enough).
const CET = 1;

function cetNow() {
  return new Date(Date.now() + CET * 3600000);
}

// Quest window: 8am–10pm CET every day.
export function isQuestActive() {
  const h = cetNow().getUTCHours();
  return h >= 8 && h < 22;
}

// During active hours:   counts down to 10pm CET (quest deadline).
// During inactive hours: counts down to 8am CET (next quest drops).
export function msUntilReset() {
  const now = cetNow();
  const h = now.getUTCHours();
  const target = new Date(now);
  if (h >= 8 && h < 22) {
    target.setUTCHours(22, 0, 0, 0);
  } else {
    if (h >= 22) target.setUTCDate(target.getUTCDate() + 1);
    target.setUTCHours(8, 0, 0, 0);
  }
  return Math.max(0, target - now);
}

// Returns the UTC Date of the most recent quest start (8am CET = 7am UTC).
export function getLastResetTime() {
  const now = new Date();
  const last = new Date(now);
  last.setUTCHours(8 - CET, 0, 0, 0);
  if (now.getUTCHours() < 8 - CET) last.setUTCDate(last.getUTCDate() - 1);
  return last;
}

export function getTodaysQuest() {
  return quests[getDayOfYear(new Date()) % quests.length];
}

export function getNextQuest() {
  const i = getDayOfYear(new Date()) % quests.length;
  return quests[(i + 1) % quests.length];
}
