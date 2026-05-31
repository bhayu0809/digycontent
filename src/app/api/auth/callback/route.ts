import { createSession } from "@/lib/session";
import { getRedirectUri } from "@/lib/app-url";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
};

type GoogleUserInfo = {
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    redirect("/login?error=oauth_denied");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getRedirectUri(request);
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!clientId || !clientSecret) {
    redirect("/login?error=config_missing");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    redirect("/login?error=token_exchange_failed");
  }

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    redirect("/login?error=userinfo_failed");
  }

  const user = (await userInfoRes.json()) as GoogleUserInfo;

  if (!user.verified_email) {
    redirect("/login?error=email_not_verified");
  }

  if (allowedEmails.length > 0 && !allowedEmails.includes(user.email)) {
    redirect("/login?error=not_allowed");
  }

  await createSession({ email: user.email, name: user.name, picture: user.picture });
  redirect("/");
}
