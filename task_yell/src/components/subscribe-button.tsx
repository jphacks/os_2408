"use client";

import { auth, db, firebaseApp } from "@/firebase/client-app";
import { createData, readSingleData, updateData } from "@/firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { useCallback, useState, useTransition } from "react";

export function SubscribeButton() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const handleClick = useCallback(() => {
    startTransition(async () => {
      if (!auth.currentUser) {
        setMessage("ログインしてください");
        return;
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
                applicationServerKey:
                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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
            "fcm-tokens": tokens
          });
        } else {
          await createData("users", {
            name: auth.currentUser.displayName || "",
            "fcm-tokens": tokens,
          });
        }
        setMessage(`通知を許可しました. Token: ${token}`);
      } else {
        setMessage("通知が許可されていません");
      }
    });
  }, []);

  return (
    <>
      <button type="button" onClick={handleClick}>
        {pending ? "Subscribing..." : "Subscribe"}
      </button>
      {message && <p>{message}</p>}
    </>
  );
}
