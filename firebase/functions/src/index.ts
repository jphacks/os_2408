import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { DocumentReference } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// タイムゾーンは日本時間
export const pushNotification = functions.scheduler
  .onSchedule({
    schedule: "every 1 minutes", timeZone: "Asia/Tokyo"
  }, async () => {
    const now = (() => {
      let s = admin.firestore.Timestamp.now().seconds
      s = s - s % 60
      return new admin.firestore.Timestamp(s, 0)
    })()
    const next = (() => {
      const s = now.seconds + 60;
      return new admin.firestore.Timestamp(s, 0);
    })();
    console.log(`now: ${now.toDate()}`)
    // リマインダーコレクションから現在時刻のリマインダーをクエリ
    const db = admin.firestore()
    const notifications = await Promise.all((await db.collection('notifications')
      .where('datetime', '<', next)
      .where('datetime', '>=', now)
      .where("type", "==", "push")
      .get())
      .docs
      .map(async doc => {
        const eventRef = (await doc.get("eventOrTaskRef")) as DocumentReference;
        console.log(`eventRef: ${eventRef.path}`)
        console.log(`userId: ${doc.get("userId")}`)
        const event = await eventRef.get();
        console.log(`event: ${event.data()}`)
        const tokens = await db.collection("users")
          .doc(doc.get("userId"))
          .get().then(doc => doc.get("fcm-tokens")) as string[];

        return {
          title: event.get("title"),
          description: event.get("description"),
          tokens
        }
      }));

    const messaging = admin.messaging();
    for (const notification of notifications) {
      console.log(`notification: ${notification}`)
      await messaging.sendEachForMulticast({
        tokens: notification.tokens,
        notification: {
          title: notification.title,
          body: notification.description
        }
      })
    }
  });
