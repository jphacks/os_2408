import { auth, firebaseApp } from "@/firebase/client-app";
import { createData, readSingleData, updateData } from "@/firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

export async function subscribeNotification() {
  if (!auth.currentUser) {
    return "ログインしてください";
  }
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const messaging = getMessaging(firebaseApp);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope,
          );
          // Now you can proceed with push subscription
          return registration.pushManager.subscribe({
            userVisibleOnly: true, // Ensures that the push notifications are always visible
            applicationServerKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
        })
        .then((subscription) => {
          console.log("Push subscription successful:", subscription);
        })
        .catch((err) => {
          console.error(
            "Service Worker registration or subscription failed:",
            err,
          );
        });
    } else {
      console.warn("Service workers are not supported by this browser.");
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    const user = await readSingleData<{
      name: string;
      "fcm-tokens": string[];
    }>("users", auth.currentUser.uid);
    const tokens = user?.["fcm-tokens"] || [];
    if (tokens.includes(token)) {
      return;
    }
    tokens.push(token);
    if (user) {
      await updateData("users", auth.currentUser.uid, {
        "fcm-tokens": tokens,
      });
    } else {
      await createData("users", {
        name: auth.currentUser.displayName || "",
        "fcm-tokens": tokens,
      });
    }
    return "通知を許可しました";
  } else {
    return "通知が許可されていません";
  }
}
