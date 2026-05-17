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

function getDayOfYear(utcMidnight) {
  const start = Date.UTC(utcMidnight.getUTCFullYear(), 0, 1);
  return Math.floor((utcMidnight - start) / 86400000) + 1;
}

function seeded(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function utcMidnight(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Hard-coded overrides for specific UTC dates { hourCET, minute, second }
const OVERRIDES = {
  '2026-05-16': { hourCET: 14, minute: 0, second: 0 },
  '2026-05-18': { hourCET: 14, minute: 0, second: 0 },
};

// utcDay must be a Date at UTC midnight for the target calendar day
function getResetDateFor(utcDay) {
  const key = utcDay.toISOString().slice(0, 10);
  const day = getDayOfYear(utcDay);
  const ov = OVERRIDES[key];
  const hourCET = ov ? ov.hourCET : 8 + Math.floor(seeded(day * 3) * 14);
  const minute  = ov ? ov.minute  : Math.floor(seeded(day * 7)  * 60);
  const second  = ov ? ov.second  : Math.floor(seeded(day * 13) * 60);
  const reset = new Date(utcDay);
  reset.setUTCHours(hourCET - 1, minute, second, 0); // CET = UTC+1
  return reset;
}

export function msUntilReset() {
  const now = new Date();
  const todayReset = getResetDateFor(utcMidnight(now));
  if (todayReset > now) return todayReset - now;
  const tomorrow = utcMidnight(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return Math.max(0, getResetDateFor(tomorrow) - now);
}

export function getLastResetTime() {
  const now = new Date();
  const todayReset = getResetDateFor(utcMidnight(now));
  if (todayReset <= now) return todayReset;
  const yesterday = utcMidnight(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getResetDateFor(yesterday);
}

export function getTodaysQuest() {
  const now = new Date();
  const todayMidnight = utcMidnight(now);
  const todayReset = getResetDateFor(todayMidnight);
  if (todayReset <= now) {
    return quests[getDayOfYear(todayMidnight) % quests.length];
  }
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setUTCDate(yesterdayMidnight.getUTCDate() - 1);
  return quests[getDayOfYear(yesterdayMidnight) % quests.length];
}

export function getNextQuest() {
  const now = new Date();
  const todayMidnight = utcMidnight(now);
  const todayReset = getResetDateFor(todayMidnight);
  if (todayReset <= now) {
    const tomorrowMidnight = new Date(todayMidnight);
    tomorrowMidnight.setUTCDate(tomorrowMidnight.getUTCDate() + 1);
    return quests[getDayOfYear(tomorrowMidnight) % quests.length];
  }
  return quests[getDayOfYear(todayMidnight) % quests.length];
}
