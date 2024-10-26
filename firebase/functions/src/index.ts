import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import type { DocumentReference } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

async function getNotifications(type: "push" | "call") {
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
  return await Promise.all((await db.collection('notifications')
    .where('datetime', '<', next)
    .where('datetime', '>=', now)
    .where("type", "==", type)
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
        userId: doc.get("userId"),
        tokens
      }
    }));
}

// タイムゾーンは日本時間
export const pushNotification = functions.scheduler
  .onSchedule({
    schedule: "every 1 minutes", timeZone: "Asia/Tokyo"
  }, async () => {
    const notifications = await getNotifications("push")

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

export const callNotification = functions.scheduler
  .onSchedule({
    schedule: "every 1 minutes", timeZone: "Asia/Tokyo"
  }, async () => {
    const notifications = await getNotifications("call");

    const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log(`notifications: ${notifications}`);
    for (const notification of notifications) {
      console.log(`notification: ${notification}`);
      // 電話番号を取得
      const phoneNumber = (await admin
        .firestore()
        .collection("users")
        .doc(notification.userId)
        .get()
        .then((doc) => (doc.exists ? doc.get("phoneNumber") as string : null)));

      if (phoneNumber) {
        // 電話をかける
        await client.calls.create({
          twiml: `<Response><Say language="ja-JP">これは ${notification.title} の通知です。</Say></Response>`,
          to: phoneNumber,
          from: process.env.TWILIO_FROM,
        });
      }
    }
  });
