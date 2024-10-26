// セキュリティってなあに？
import { google, calendar_v3 } from 'googleapis';
import { type NextRequest } from "next/server";
import { firebaseAdminApp } from '@/firebase/server-app';

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.NODE_ENV === "development"
      ? "https://localhost:3000/api/auth/google-cal/callback"
      : "https://taskyell.vercel.app/api/auth/google-cal/callback");
}

function getDate(date: calendar_v3.Schema$EventDateTime | undefined) {
  if (date === undefined) {
    return null;
  }

  if (date.date) {
    return new Date(date.date);
  } else if (date.dateTime) {
    return new Date(date.dateTime);
  }
  return null;
}

export async function GET(req: NextRequest) {
  // OAuth2.0のクライアント
  const oauth2Client = createOAuth2Client();

  // 認証コードの取得
  // ?code=xxxxxのURLパラメータをget
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  if (!userId) {
    return new Response(`Missing state parameter`, {
      status: 400,
    });
  }

  if (!code) {
    return new Response(`Missing query parameter`, {
      status: 400,
    });
  }

  // 認証コードからトークンの生成
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const list = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const ref = firebaseAdminApp.firestore().collection(`users/${userId}/events`);
  const events = (list.data.items || []).map((event) => ({
    title: event.summary || "",
    description: event.description || "",
    start: getDate(event.start),
    end: getDate(event.end),
    attendees: event.attendees?.filter((item) => item.email).map((attendee) => attendee.email as string) || [],
    importance: "medium",
    location: null,
    reccurence: event.recurrence || [],
  }));

  for (const event of events) {
    await ref.add(event);
  }
}