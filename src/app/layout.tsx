import type { Metadata, Viewport } from "next";
import { getProfile } from "@/lib/profile";
import "./globals.css";

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "Unbounded:wght@400;600;800",
    "Syne:wght@400;700;800",
    "Space+Grotesk:wght@400;600;700",
    "Orbitron:wght@500;700;900",
    "Bricolage+Grotesque:wght@400;700;800",
    "Instrument+Serif:ital@0;1",
    "Sora:wght@300;400;600;700",
    "Outfit:wght@400;600;700",
    "Inter:wght@400;600;700",
    "JetBrains+Mono:wght@400;600",
  ]
    .map((f) => `family=${f}`)
    .join("&") +
  "&display=swap";

async function safeProfile() {
  try {
    return await getProfile();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await safeProfile();
  const title = p?.siteTitle || "bio";
  const description = p?.metaDescription || `${p?.displayName ?? ""}`.trim() || "a bio";
  return {
    title,
    description,
    icons: p?.faviconUrl ? { icon: p.faviconUrl } : undefined,
    openGraph: {
      title,
      description,
      images: p?.avatarUrl ? [{ url: p.avatarUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const p = await safeProfile();
  return {
    width: "device-width",
    initialScale: 1,
    // Allow pinch-zoom (accessibility) but don't zoom in on input focus.
    maximumScale: 5,
    themeColor: p?.embedColor || "#8b5cf6",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
