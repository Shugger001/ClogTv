/**
 * Public site URLs. Override via env on Vercel / .env.local.
 */
export const siteSocial = {
  x: process.env.NEXT_PUBLIC_SOCIAL_X_URL ?? "https://x.com/",
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL ?? "https://www.facebook.com/",
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL ?? "https://www.youtube.com/",
} as const;
