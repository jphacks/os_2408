"use client";

import { auth } from "@/firebase/client-app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // サインインしていない場合、サインインページにリダイレクト
    auth.authStateReady().then(() => {
      if (!auth.currentUser) {
        router.push("/signin");
      } else {
        router.push("/home");
      }
    });
  }, [router]);

  return <></>;
}
