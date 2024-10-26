import "server-only";

import admin from "firebase-admin";

export const firebaseAdminApp =
  admin.apps.length === 0
    ? admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
          privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n",
          ),
        }),
      })
    : (admin.apps[0] as admin.app.App);
