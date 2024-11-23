"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/firebase/auth";
import { auth, db } from "@/firebase/client-app";
import { subscribeNotification } from "@/lib/push-notification";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  Menu,
  Bell,
  Users,
  Download,
  LogOut,
  PhoneCall,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

export function Navigation({ isDarkMode, setIsDarkMode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const router = useRouter();

  const menuItems = useMemo(() => [
    {
      icon: PhoneCall,
      label: "電話通知",
      onClick: () => {
        return setIsNotificationsOpen(!isNotificationsOpen);
      },
    },
    {
      icon: Bell,
      label: "プッシュ通知",
      onClick: async () => {
        await subscribeNotification();
      },
    },
    { icon: Users, label: "友達", onClick: () => console.log("友達") },
    {
      icon: Download,
      label: "インポート",
      onClick: () => {
        if (auth.currentUser) {
          router.push(
            `/api/auth/google-cal?userId=${encodeURIComponent(auth.currentUser.uid)}`,
          );
        }
      },
    },
    {
      icon: LogOut,
      label: "ログアウト",
      onClick: async () => {
        await signOut();
        router.refresh();
      },
    },
  ], [isNotificationsOpen, router]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {/* CSS変更する必要あるかも */}
          <Menu className="h-6 w-6" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>設定</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
            <Label htmlFor="dark-mode">ダークモード</Label>
          </div>
        </div>
        <nav className="mt-8">
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={item.onClick}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
                {item.label === "電話通知" && isNotificationsOpen && (
                  <form
                    className="ml-7 mt-2 space-y-4"
                    action={async (data) => {
                      if (auth.currentUser) {
                        const docRef = doc(db, "users", auth.currentUser.uid);
                        const snapshot = await getDoc(docRef);
                        if (snapshot.exists()) {
                          await updateDoc(docRef, {
                            phoneNumber: data.get("phoneNumber"),
                          });
                        } else {
                          setDoc(docRef, {
                            phoneNumber: data.get("phoneNumber"),
                          });
                        }
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        name="phoneNumber"
                        placeholder="+8190XXXXYYYY"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                      <Label htmlFor="notifications">通知を有効にする</Label>
                    </div>
                    <Button type="submit">保存</Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}