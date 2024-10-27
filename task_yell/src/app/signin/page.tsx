"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useCallback } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/client-app";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const handleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      router.push("/home");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            サインイン
          </h1>
          <p className="text-center text-gray-600">
            Googleアカウントを使用して簡単にサインインできます。
          </p>
          <Button
            variant="default"
            className="w-full flex items-center justify-center space-x-2"
            onClick={handleSignIn}
          >
            <Chrome className="w-5 h-5" />
            <span>Googleでサインイン</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
