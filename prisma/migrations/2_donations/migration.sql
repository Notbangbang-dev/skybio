-- Link-based donations (custom amount prefilled into the payment URL).

ALTER TABLE "Profile" ADD COLUMN "donateEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN "donateTitle" TEXT NOT NULL DEFAULT 'Support me';
ALTER TABLE "Profile" ADD COLUMN "donateText" TEXT NOT NULL DEFAULT 'Every bit helps — thank you 💜';
ALTER TABLE "Profile" ADD COLUMN "donateCurrency" TEXT NOT NULL DEFAULT '$';
ALTER TABLE "Profile" ADD COLUMN "donatePresets" TEXT NOT NULL DEFAULT '5,10,25,50';
ALTER TABLE "Profile" ADD COLUMN "cashappTag" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "paypalUser" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "venmoUser" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "kofiUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "cryptoBtc" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Profile" ADD COLUMN "cryptoEth" TEXT NOT NULL DEFAULT '';
