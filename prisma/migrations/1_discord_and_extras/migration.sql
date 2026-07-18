-- Live Discord presence (Lanyard) + extra customization fields.

ALTER TABLE "Profile" ADD COLUMN "avatarSize" INTEGER NOT NULL DEFAULT 112;
ALTER TABLE "Profile" ADD COLUMN "discordEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN "discordUserId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "discordShowActivity" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Profile" ADD COLUMN "cardWidth" INTEGER NOT NULL DEFAULT 448;
ALTER TABLE "Profile" ADD COLUMN "overlayColor" TEXT NOT NULL DEFAULT '#000000';
ALTER TABLE "Profile" ADD COLUMN "glowBehindCard" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Profile" ADD COLUMN "effectConfetti" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN "footerText" TEXT NOT NULL DEFAULT '';
