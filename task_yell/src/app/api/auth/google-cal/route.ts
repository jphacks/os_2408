import { google } from 'googleapis';
import { redirect } from "next/navigation";
import { NextRequest } from 'next/server';

// Google 認証後、ユーザーに許可を得る認可スコープ
// この場合は、DriveへのRead権限の認可
const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.NODE_ENV === "development"
      ? "https://localhost:3000/api/auth/google-cal/callback"
      : "https://taskyell.vercel.app/api/auth/google-cal/callback");
}

// urlパラメータにユーザーIDを持たせる
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const oauth2Client = createOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: userId || undefined,
  });

  redirect(url);
}