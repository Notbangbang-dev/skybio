"use client";

import * as React from "react";
import { Heart, Copy, Check, ExternalLink } from "lucide-react";

export interface DonateConfig {
  title: string;
  text: string;
  currency: string;
  presets: number[];
  cashapp: string;
  paypal: string;
  venmo: string;
  kofi: string;
  btc: string;
  eth: string;
}

interface MethodLink {
  key: string;
  label: string;
  color: string;
  href: string;
  needsAmount: boolean;
}

export function DonatePanel({ config }: { config: DonateConfig }) {
  const [amount, setAmount] = React.useState<string>(
    config.presets[0] ? String(config.presets[0]) : ""
  );
  const amt = Math.max(0, Number.parseFloat(amount) || 0);
  const a = amt > 0 ? amt : "";

  const links: MethodLink[] = [];
  if (config.cashapp)
    links.push({
      key: "cashapp",
      label: "Cash App",
      color: "#00d632",
      href: `https://cash.app/$${config.cashapp}${a ? `/${a}` : ""}`,
      needsAmount: false,
    });
  if (config.paypal)
    links.push({
      key: "paypal",
      label: "PayPal",
      color: "#0070ba",
      href: `https://paypal.me/${config.paypal}${a ? `/${a}` : ""}`,
      needsAmount: false,
    });
  if (config.venmo)
    links.push({
      key: "venmo",
      label: "Venmo",
      color: "#008cff",
      href: `https://venmo.com/${config.venmo}${a ? `?txn=pay&amount=${a}` : ""}`,
      needsAmount: false,
    });
  if (config.kofi)
    links.push({ key: "kofi", label: "Ko-fi", color: "#ff5e5b", href: config.kofi, needsAmount: false });

  const cryptos = [
    { key: "btc", label: "Bitcoin (BTC)", value: config.btc },
    { key: "eth", label: "Ethereum (ETH)", value: config.eth },
  ].filter((c) => c.value);

  const hasAny = links.length > 0 || cryptos.length > 0;

  return (
    <div
      className="glass animate-scale-in w-full max-w-md rounded-[var(--radius)] p-6 sm:p-8"
      style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
    >
      <div className="flex flex-col items-center text-center">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{ background: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        >
          <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-color)" }}>
          {config.title}
        </h1>
        {config.text && (
          <p className="mt-2 max-w-sm text-sm" style={{ color: "color-mix(in srgb, var(--text-color) 75%, transparent)" }}>
            {config.text}
          </p>
        )}
      </div>

      {!hasAny && (
        <p className="mt-6 rounded-xl border border-dashed py-6 text-center text-sm" style={{ color: "color-mix(in srgb, var(--text-color) 60%, transparent)", borderColor: "color-mix(in srgb, var(--text-color) 20%, transparent)" }}>
          No donation methods configured yet.
        </p>
      )}

      {links.length > 0 && (
        <>
          {/* amount picker */}
          <div className="mt-6">
            <div className="mb-2 grid grid-cols-4 gap-2">
              {config.presets.map((v) => {
                const active = amt === v;
                return (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="press rounded-xl border py-2 text-sm font-semibold tabular-nums transition-colors"
                    style={{
                      borderColor: active
                        ? "var(--accent)"
                        : "color-mix(in srgb, var(--text-color) 15%, transparent)",
                      background: active ? "color-mix(in srgb, var(--accent) 20%, transparent)" : "transparent",
                      color: "var(--text-color)",
                    }}
                  >
                    {config.currency}
                    {v}
                  </button>
                );
              })}
            </div>
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor: "color-mix(in srgb, var(--text-color) 15%, transparent)" }}
            >
              <span className="text-lg font-semibold" style={{ color: "color-mix(in srgb, var(--text-color) 70%, transparent)" }}>
                {config.currency}
              </span>
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
                style={{ color: "var(--text-color)" }}
              />
            </div>
          </div>

          {/* method buttons */}
          <div className="mt-4 grid gap-2">
            {links.map((m) => (
              <a
                key={m.key}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="press flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: m.color }}
              >
                {m.key === "kofi"
                  ? `Support on ${m.label}`
                  : `Donate ${a ? `${config.currency}${a} ` : ""}with ${m.label}`}
                <ExternalLink className="h-4 w-4 opacity-80" />
              </a>
            ))}
          </div>
        </>
      )}

      {/* crypto */}
      {cryptos.length > 0 && (
        <div className="mt-5 space-y-2">
          {cryptos.map((c) => (
            <CryptoRow key={c.key} label={c.label} value={c.value} />
          ))}
        </div>
      )}
    </div>
  );
}

function CryptoRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2"
      style={{ borderColor: "color-mix(in srgb, var(--text-color) 14%, transparent)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium" style={{ color: "color-mix(in srgb, var(--text-color) 60%, transparent)" }}>
          {label}
        </div>
        <div className="truncate font-mono text-xs" style={{ color: "var(--text-color)" }}>
          {value}
        </div>
      </div>
      <button
        onClick={copy}
        className="press grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: "color-mix(in srgb, var(--text-color) 10%, transparent)", color: "var(--text-color)" }}
        aria-label="Copy address"
      >
        {copied ? <Check className="h-4 w-4" style={{ color: "#43b581" }} /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
