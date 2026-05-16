const admin = require('firebase-admin');

const quests = [
  { emoji: '🔴', tagline: "I'm Red" },
  { emoji: '🐶', tagline: 'Good Boy' },
  { emoji: '📞', tagline: 'Hey Mom' },
  { emoji: '☀️', tagline: 'Golden Hour' },
  { emoji: '🌿', tagline: 'Touch Grass' },
  { emoji: '☕', tagline: 'Cozy Corner' },
  { emoji: '🪞', tagline: 'Mirror Mirror' },
  { emoji: '🍕', tagline: "Today's Meal" },
  { emoji: '🌧️', tagline: 'Rain Dance' },
  { emoji: '📚', tagline: 'On My Shelf' },
];

const OVERRIDES = {
  '2026-05-16': { hourCET: 14, minute: 0, second: 0 },
};

function getDayOfYear(d) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d - start) / 86400000) + 1;
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

function getResetDateFor(utcDay) {
  const key = utcDay.toISOString().slice(0, 10);
  const day = getDayOfYear(utcDay);
  const ov = OVERRIDES[key];
  const hourCET = ov ? ov.hourCET : 8 + Math.floor(seeded(day * 3) * 14);
  const minute  = ov ? ov.minute  : Math.floor(seeded(day * 7)  * 60);
  const second  = ov ? ov.second  : Math.floor(seeded(day * 13) * 60);
  const reset = new Date(utcDay);
  reset.setUTCHours(hourCET - 1, minute, second, 0);
  return reset;
}

function getTodaysQuest() {
  const now = new Date();
  const day = getDayOfYear(now);
  return quests[day % quests.length];
}

async function main() {
  const now = new Date();
  const todayReset = getResetDateFor(utcMidnight(now));
  const diffMinutes = Math.abs(now - todayReset) / 60000;

  // Only send if we're within 30 minutes of the reset time
  if (diffMinutes > 30) {
    console.log(`Not quest time yet. Reset at ${todayReset.toISOString()}, now is ${now.toISOString()}, diff: ${diffMinutes.toFixed(1)}min`);
    process.exit(0);
  }

  // Only send if quest just dropped (not in the past more than 30min)
  if (now < todayReset) {
    console.log('Quest has not dropped yet.');
    process.exit(0);
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const db = admin.firestore();
  const quest = getTodaysQuest();

  const snapshot = await db.collection('users')
    .where('notificationsEnabled', '==', true)
    .get();

  const tokens = snapshot.docs
    .map(d => d.data().fcmToken)
    .filter(Boolean);

  if (tokens.length === 0) {
    console.log('No users with notifications enabled.');
    process.exit(0);
  }

  console.log(`Sending to ${tokens.length} users: ${quest.emoji} ${quest.tagline}`);

  const message = {
    notification: {
      title: `${quest.emoji} new quest dropped!`,
      body: quest.tagline,
    },
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  console.log(`Sent: ${response.successCount} success, ${response.failureCount} failed`);
}

main().catch(console.error);
