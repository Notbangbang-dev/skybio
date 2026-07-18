import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware uses the adapter-free config. Ownership is re-checked
// server-side in requireOwner().
export const { auth: middleware } = NextAuth(authConfig);

export default middleware(() => {
  // The `authorized` callback in authConfig makes the redirect decision.
  return;
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mp3|ogg|wav)$).*)",
  ],
};
