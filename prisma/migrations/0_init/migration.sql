-- skybio initial schema

-- ── Auth.js ──────────────────────────────────────────────────────────────────
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "discordId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- ── Bio config singleton ─────────────────────────────────────────────────────
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "displayName" TEXT NOT NULL DEFAULT 'your name',
    "username" TEXT NOT NULL DEFAULT 'user',
    "bio" TEXT NOT NULL DEFAULT 'welcome to my corner of the internet ✦',
    "avatarUrl" TEXT,
    "avatarStyle" TEXT NOT NULL DEFAULT 'glow',
    "location" TEXT NOT NULL DEFAULT '',
    "pronouns" TEXT NOT NULL DEFAULT '',
    "bgType" TEXT NOT NULL DEFAULT 'gradient',
    "bgUrl" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT '#05060a',
    "bgBlur" INTEGER NOT NULL DEFAULT 0,
    "bgBrightness" INTEGER NOT NULL DEFAULT 65,
    "bgOverlay" INTEGER NOT NULL DEFAULT 45,
    "accent" TEXT NOT NULL DEFAULT '#8b5cf6',
    "accent2" TEXT NOT NULL DEFAULT '#22d3ee',
    "textColor" TEXT NOT NULL DEFAULT '#f5f5fb',
    "displayFont" TEXT NOT NULL DEFAULT 'Unbounded',
    "bodyFont" TEXT NOT NULL DEFAULT 'Sora',
    "radius" INTEGER NOT NULL DEFAULT 28,
    "cardOpacity" INTEGER NOT NULL DEFAULT 50,
    "cardBlur" INTEGER NOT NULL DEFAULT 22,
    "nameEffect" TEXT NOT NULL DEFAULT 'shine',
    "effectParticles" BOOLEAN NOT NULL DEFAULT true,
    "effectStars" BOOLEAN NOT NULL DEFAULT true,
    "effectCursor" BOOLEAN NOT NULL DEFAULT true,
    "effectRain" BOOLEAN NOT NULL DEFAULT false,
    "effectTilt" BOOLEAN NOT NULL DEFAULT true,
    "effectGrain" BOOLEAN NOT NULL DEFAULT true,
    "particleColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "particleDensity" INTEGER NOT NULL DEFAULT 60,
    "splashEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enterText" TEXT NOT NULL DEFAULT 'click to enter',
    "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "volume" INTEGER NOT NULL DEFAULT 45,
    "showVisualizer" BOOLEAN NOT NULL DEFAULT true,
    "loopTracks" BOOLEAN NOT NULL DEFAULT true,
    "siteTitle" TEXT NOT NULL DEFAULT 'bio',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "faviconUrl" TEXT,
    "embedColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "showViews" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "coverUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Track_sortOrder_idx" ON "Track"("sortOrder");

CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink"("sortOrder");
