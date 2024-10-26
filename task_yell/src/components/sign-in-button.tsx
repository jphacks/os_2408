"use client";

import { onAuthStateChanged } from "@/firebase/auth";
import { auth } from "@/firebase/client-app";
import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function useUserSession() {
  // The initialUser comes from the server via a server component
  const [user, setUser] = useState<User | null>();
  const router = useRouter();

  // Register the service worker that sends auth state back to server
  // The service worker is built with npm run build-service-worker
  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     const serializedFirebaseConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
  //     const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`

  //     navigator.serviceWorker
  //       .register(serviceWorkerUrl)
  //       .then((registration) => console.log("scope is: ", registration.scope));
  //   }
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      if (user === undefined) return

      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.refresh])

  return user;
}

export function SignInButton() {
  const user = useUserSession();
  const handleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);
  const handleSignOut = useCallback(async () => {
    console.log("signing out")
    await auth.signOut();
  }, []);

  return !user ?
    (<button type="button" onClick={handleSignIn} >
      サインイン
    </button>) : (<button type="button" onClick={handleSignOut}>
      サインアウト
    </button>
    )
}