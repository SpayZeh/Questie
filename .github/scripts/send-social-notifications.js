import admin from 'firebase-admin';

const PUSH_TITLES = {
  request:  (n) => `${n.fromUsername} wants to be your questie!`,
  accepted: (n) => `${n.fromUsername} accepted your questie request!`,
  comment:  (n) => `${n.fromUsername} commented on your quest`,
  reaction: (n) => `${n.fromUsername} reacted to your quest`,
};

async function main() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const db = admin.firestore();

  const snap = await db.collectionGroup('notifications')
    .where('pushed', '==', false)
    .get();

  if (snap.empty) {
    console.log('No pending notifications.');
    return;
  }

  console.log(`Found ${snap.docs.length} unpushed notifications.`);

  for (const notifDoc of snap.docs) {
    const notif = notifDoc.data();
    const userId = notifDoc.ref.parent.parent.id;

    // Mark as pushed immediately to avoid duplicates on retry
    await notifDoc.ref.update({ pushed: true });

    const titleFn = PUSH_TITLES[notif.type];
    if (!titleFn) continue;

    const userSnap = await db.collection('users').doc(userId).get();
    const fcmToken = userSnap.data()?.fcmToken;
    if (!fcmToken) continue;

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: titleFn(notif),
          body: notif.type === 'comment' ? notif.text : 'open questie to see',
        },
      });
      console.log(`Pushed ${notif.type} to ${userId}`);
    } catch (e) {
      console.error(`Failed to push to ${userId}:`, e.message);
    }
  }
}

main().catch(console.error);
