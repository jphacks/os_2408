/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import type { DocumentReference } from "firebase-admin/firestore";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const pushNotification = functions.scheduler
  .onSchedule("every 1 minutes", async () => {
    const now = (() => {
      let s = admin.firestore.Timestamp.now().seconds
      s = s - s % 60
      return new admin.firestore.Timestamp(s, 0)
    })()
    // リマインダーコレクションから現在時刻のリマインダーをクエリ
    const db = admin.firestore()
    const notifications = await Promise.all((await db.collection('notifications')
      .where('datetime', '==', now)
      .where("type", "==", "push")
      .get())
      .docs
      .map(async doc => {
        const event = await (doc.get("eventOrTaskRef") as DocumentReference).get();
        const tokens = await db.collection("users").doc(doc.get("userId")).get().then(doc => doc.get("fcm-tokens")) as string[];
        return {
          title: event.get("title"),
          description: event.get("description"),
          tokens
        }
      }));

      const messaging = admin.messaging();
      for (const notification of notifications) {
        await messaging.sendEachForMulticast({
          tokens: notification.tokens,
          notification: {
            title: notification.title,
            body: notification.description
          }
        })
      }
  });
