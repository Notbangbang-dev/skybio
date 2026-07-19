import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { themeVars } from "@/lib/theme";
import { DonatePanel, type DonateConfig } from "@/components/donate/donate-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Donate" };

export default async function DonatePage() {
  const p = await getProfile();
  if (!p.donateEnabled) redirect("/");

  const presets = p.donatePresets
    .split(",")
    .map((s) => Number.parseFloat(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 8);

  const config: DonateConfig = {
    title: p.donateTitle,
    text: p.donateText,
    currency: p.donateCurrency || "$",
    presets: presets.length ? presets : [5, 10, 25, 50],
    cashapp: p.cashappTag,
    paypal: p.paypalUser,
    venmo: p.venmoUser,
    kofi: p.kofiUrl,
    btc: p.cryptoBtc,
    eth: p.cryptoEth,
  };

  return (
    <main
      className="min-h-dscreen relative grid place-items-center overflow-hidden px-4 py-20 font-sans"
      style={{ ...themeVars(p), color: "var(--text-color)", background: "var(--bg-color)" }}
    >
      {/* atmospheric backdrop matching the bio theme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 20% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%), radial-gradient(120% 120% at 80% 100%, color-mix(in srgb, var(--accent-2) 22%, transparent), transparent 55%)",
        }}
      />

      <Link
        href="/"
        className="press absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"
        style={{
          background: "color-mix(in srgb, var(--text-color) 8%, transparent)",
          color: "var(--text-color)",
          border: "1px solid color-mix(in srgb, var(--text-color) 14%, transparent)",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <DonatePanel config={config} />
      </div>
    </main>
  );
}
