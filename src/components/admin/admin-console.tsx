"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  User, Palette, Image as ImageIcon, Sparkles, Music, Link2, Globe,
  Save, Upload, Trash2, Plus, Loader2, MessageCircle, Heart,
} from "lucide-react";
import {
  saveProfile, addTrack, updateTrack, deleteTrack,
  addSocial, updateSocial, deleteSocial, type ProfileInput,
} from "@/actions/profile";
import {
  DISPLAY_FONTS, BODY_FONTS, NAME_EFFECTS, AVATAR_STYLES, BG_TYPES, SOCIAL_PLATFORMS,
} from "@/lib/theme";

export type ProfileForm = ProfileInput;
export interface AdminTrack { id: string; title: string; artist: string; url: string; coverUrl: string; }
export interface AdminSocial { id: string; platform: string; url: string; label: string; }
export interface AdminData { profile: ProfileForm; tracks: AdminTrack[]; socials: AdminSocial[]; }

const TABS = [
  { key: "identity", label: "Identity", icon: User },
  { key: "discord", label: "Discord", icon: MessageCircle },
  { key: "look", label: "Look", icon: Palette },
  { key: "background", label: "Background", icon: ImageIcon },
  { key: "effects", label: "Effects", icon: Sparkles },
  { key: "music", label: "Music", icon: Music },
  { key: "socials", label: "Socials", icon: Link2 },
  { key: "donate", label: "Donate", icon: Heart },
  { key: "meta", label: "Meta", icon: Globe },
] as const;

// ── upload helper ──────────────────────────────────────────────────────────
async function uploadFile(kind: "image" | "video" | "audio", file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`/api/admin/upload?kind=${kind}`, { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) return data.url as string;
  toast.error(data.error ?? "Upload failed");
  return null;
}

export function AdminConsole({ data }: { data: AdminData }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<(typeof TABS)[number]["key"]>("identity");
  const [form, setForm] = React.useState<ProfileForm>(data.profile);
  const [badgesText, setBadgesText] = React.useState(data.profile.badges.join(", "));
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const res = await saveProfile({
      ...form,
      badges: badgesText.split(",").map((b) => b.trim()).filter(Boolean),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Saved — refresh your bio to see it");
      router.refresh();
    } else toast.error(res.error ?? "Failed to save");
  }

  return (
    <div className="pb-28">
      <Toaster theme="dark" position="top-center" richColors />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white/10 text-white" : "text-muted hover:bg-white/5"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "identity" && (
        <Section title="Identity" desc="Who you are.">
          <div className="flex items-center gap-4">
            <Avatar url={form.avatarUrl} name={form.displayName} />
            <UploadBtn kind="image" label="Upload avatar" onDone={(u) => set("avatarUrl", u)} />
            {form.avatarUrl && (
              <button className="text-xs text-muted underline" onClick={() => set("avatarUrl", "")}>
                remove
              </button>
            )}
          </div>
          <Grid>
            <Text label="Display name" value={form.displayName} onChange={(v) => set("displayName", v)} />
            <Text label="Username / handle" value={form.username} onChange={(v) => set("username", v)} />
            <Text label="Pronouns" value={form.pronouns} onChange={(v) => set("pronouns", v)} placeholder="they/them" />
            <Text label="Location" value={form.location} onChange={(v) => set("location", v)} placeholder="the internet" />
          </Grid>
          <Area label="Bio" value={form.bio} onChange={(v) => set("bio", v)} rows={4} />
          <Text label="Badges (comma separated)" value={badgesText} onChange={setBadgesText} placeholder="developer, owner, early" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Avatar style" value={form.avatarStyle} options={[...AVATAR_STYLES]} onChange={(v) => set("avatarStyle", v)} />
            <Range label="Avatar size" value={form.avatarSize} min={64} max={200} suffix="px" onChange={(v) => set("avatarSize", v)} />
          </div>
        </Section>
      )}

      {tab === "discord" && (
        <Section title="Discord presence" desc="Show your live Discord status + activity on your bio.">
          <div className="rounded-xl border border-line bg-panel-2 p-3 text-xs text-muted">
            Powered by <span className="font-medium text-white">Lanyard</span>. Join{" "}
            <a href="https://discord.gg/lanyard" target="_blank" rel="noreferrer" className="underline">
              discord.gg/lanyard
            </a>{" "}
            with the account below so your presence can be tracked — otherwise it shows offline.
          </div>
          <Toggle label="Show Discord presence" checked={form.discordEnabled} onChange={(v) => set("discordEnabled", v)} />
          <Text
            label="Discord user ID"
            value={form.discordUserId}
            onChange={(v) => set("discordUserId", v)}
            placeholder="1226241151065919548"
            mono
          />
          <p className="text-xs text-muted">
            Enable Developer Mode in Discord → right-click your name → Copy User ID.
          </p>
          <Toggle
            label="Show current activity (Spotify / game / custom status)"
            checked={form.discordShowActivity}
            onChange={(v) => set("discordShowActivity", v)}
          />
        </Section>
      )}

      {tab === "look" && (
        <Section title="Look & feel" desc="Colors, fonts, and the glass card.">
          <Grid>
            <Color label="Accent" value={form.accent} onChange={(v) => set("accent", v)} />
            <Color label="Accent 2" value={form.accent2} onChange={(v) => set("accent2", v)} />
            <Color label="Text color" value={form.textColor} onChange={(v) => set("textColor", v)} />
            <Color label="Base color" value={form.bgColor} onChange={(v) => set("bgColor", v)} />
          </Grid>
          <Grid>
            <Select label="Display font" value={form.displayFont} options={DISPLAY_FONTS} onChange={(v) => set("displayFont", v)} />
            <Select label="Body font" value={form.bodyFont} options={BODY_FONTS} onChange={(v) => set("bodyFont", v)} />
            <Select label="Name effect" value={form.nameEffect} options={[...NAME_EFFECTS]} onChange={(v) => set("nameEffect", v)} />
          </Grid>
          <Range label="Corner radius" value={form.radius} min={0} max={60} suffix="px" onChange={(v) => set("radius", v)} />
          <Range label="Card width" value={form.cardWidth} min={320} max={640} suffix="px" onChange={(v) => set("cardWidth", v)} />
          <Range label="Card glass opacity" value={form.cardOpacity} min={0} max={100} suffix="%" onChange={(v) => set("cardOpacity", v)} />
          <Range label="Card blur" value={form.cardBlur} min={0} max={60} suffix="px" onChange={(v) => set("cardBlur", v)} />
        </Section>
      )}

      {tab === "background" && (
        <Section title="Background" desc="Image, GIF, video, gradient, or solid color.">
          <Select label="Background type" value={form.bgType} options={[...BG_TYPES]} onChange={(v) => set("bgType", v)} />
          {(form.bgType === "image" || form.bgType === "gif") && (
            <div className="flex items-center gap-3">
              <UploadBtn kind="image" label="Upload image / GIF" onDone={(u) => set("bgUrl", u)} />
              <Text label="…or paste a URL" value={form.bgUrl} onChange={(v) => set("bgUrl", v)} placeholder="https://…" grow />
            </div>
          )}
          {form.bgType === "video" && (
            <div className="flex items-center gap-3">
              <UploadBtn kind="video" label="Upload video (mp4/webm)" onDone={(u) => set("bgUrl", u)} />
              <Text label="…or paste a URL" value={form.bgUrl} onChange={(v) => set("bgUrl", v)} placeholder="https://…" grow />
            </div>
          )}
          {form.bgType === "color" && (
            <Color label="Solid color" value={form.bgColor} onChange={(v) => set("bgColor", v)} />
          )}
          <Range label="Media brightness" value={form.bgBrightness} min={0} max={200} suffix="%" onChange={(v) => set("bgBrightness", v)} />
          <Range label="Media blur" value={form.bgBlur} min={0} max={60} suffix="px" onChange={(v) => set("bgBlur", v)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Color label="Overlay color" value={form.overlayColor} onChange={(v) => set("overlayColor", v)} />
            <Range label="Overlay strength" value={form.bgOverlay} min={0} max={100} suffix="%" onChange={(v) => set("bgOverlay", v)} />
          </div>
        </Section>
      )}

      {tab === "effects" && (
        <Section title="Effects" desc="Toggle the eye candy.">
          <Toggle label="Splash screen (click to enter)" checked={form.splashEnabled} onChange={(v) => set("splashEnabled", v)} />
          {form.splashEnabled && (
            <Text label="Enter text" value={form.enterText} onChange={(v) => set("enterText", v)} placeholder="click to enter" />
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Stars" checked={form.effectStars} onChange={(v) => set("effectStars", v)} />
            <Toggle label="Floating particles" checked={form.effectParticles} onChange={(v) => set("effectParticles", v)} />
            <Toggle label="Rain" checked={form.effectRain} onChange={(v) => set("effectRain", v)} />
            <Toggle label="Cursor trail" checked={form.effectCursor} onChange={(v) => set("effectCursor", v)} />
            <Toggle label="Card tilt" checked={form.effectTilt} onChange={(v) => set("effectTilt", v)} />
            <Toggle label="Film grain" checked={form.effectGrain} onChange={(v) => set("effectGrain", v)} />
            <Toggle label="Glow behind card" checked={form.glowBehindCard} onChange={(v) => set("glowBehindCard", v)} />
            <Toggle label="Confetti on enter" checked={form.effectConfetti} onChange={(v) => set("effectConfetti", v)} />
          </div>
          <Color label="Particle color" value={form.particleColor} onChange={(v) => set("particleColor", v)} />
          <Range label="Particle density" value={form.particleDensity} min={0} max={100} suffix="%" onChange={(v) => set("particleDensity", v)} />
        </Section>
      )}

      {tab === "music" && (
        <Section title="Music" desc="Upload tracks; they play in the floating player.">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Enable music player" checked={form.musicEnabled} onChange={(v) => set("musicEnabled", v)} />
            <Toggle label="Autoplay on enter" checked={form.autoplay} onChange={(v) => set("autoplay", v)} />
            <Toggle label="Show visualizer" checked={form.showVisualizer} onChange={(v) => set("showVisualizer", v)} />
            <Toggle label="Loop playlist" checked={form.loopTracks} onChange={(v) => set("loopTracks", v)} />
          </div>
          <Range label="Default volume" value={form.volume} min={0} max={100} suffix="%" onChange={(v) => set("volume", v)} />
          <div className="mt-2 border-t border-line pt-4">
            <TrackManager tracks={data.tracks} />
          </div>
        </Section>
      )}

      {tab === "socials" && (
        <Section title="Socials" desc="Your links, shown as magnetic icons.">
          <SocialManager socials={data.socials} />
        </Section>
      )}

      {tab === "donate" && (
        <Section title="Donations" desc="Let visitors send you any custom amount. Link-based — no payment setup needed.">
          <Toggle
            label="Enable donations (adds a Donate button + /donate page)"
            checked={form.donateEnabled}
            onChange={(v) => set("donateEnabled", v)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Title" value={form.donateTitle} onChange={(v) => set("donateTitle", v)} />
            <Text label="Currency symbol" value={form.donateCurrency} onChange={(v) => set("donateCurrency", v)} placeholder="$" />
          </div>
          <Area label="Description" value={form.donateText} onChange={(v) => set("donateText", v)} rows={2} />
          <Text label="Preset amounts (comma separated)" value={form.donatePresets} onChange={(v) => set("donatePresets", v)} placeholder="5,10,25,50" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Cash App tag (no $)" value={form.cashappTag} onChange={(v) => set("cashappTag", v)} placeholder="yourtag" mono />
            <Text label="PayPal.me username" value={form.paypalUser} onChange={(v) => set("paypalUser", v)} placeholder="yourname" mono />
            <Text label="Venmo username" value={form.venmoUser} onChange={(v) => set("venmoUser", v)} placeholder="yourname" mono />
            <Text label="Ko-fi URL" value={form.kofiUrl} onChange={(v) => set("kofiUrl", v)} placeholder="https://ko-fi.com/you" />
            <Text label="Bitcoin address" value={form.cryptoBtc} onChange={(v) => set("cryptoBtc", v)} mono />
            <Text label="Ethereum address" value={form.cryptoEth} onChange={(v) => set("cryptoEth", v)} mono />
          </div>
          <p className="text-xs text-muted">
            Cash App, PayPal &amp; Venmo prefill the amount the visitor picks. Ko-fi links to your page;
            crypto shows a copyable address.
          </p>
        </Section>
      )}

      {tab === "meta" && (
        <Section title="Meta & embeds" desc="Page title, link previews, favicon.">
          <Text label="Site title (browser tab)" value={form.siteTitle} onChange={(v) => set("siteTitle", v)} />
          <Area label="Meta description (link previews)" value={form.metaDescription} onChange={(v) => set("metaDescription", v)} rows={2} />
          <Color label="Embed / theme color" value={form.embedColor} onChange={(v) => set("embedColor", v)} />
          <div className="flex items-center gap-3">
            <UploadBtn kind="image" label="Upload favicon" onDone={(u) => set("faviconUrl", u)} />
            <Text label="…or favicon URL" value={form.faviconUrl} onChange={(v) => set("faviconUrl", v)} placeholder="https://…" grow />
          </div>
          <Toggle label="Show view counter" checked={form.showViews} onChange={(v) => set("showViews", v)} />
          <Text label="Footer text" value={form.footerText} onChange={(v) => set("footerText", v)} placeholder="made with ♥" />
        </Section>
      )}

      {/* Sticky save (profile fields). Tracks/socials save on their own. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <p className="text-xs text-muted">Changes go live the moment you save.</p>
          <button
            onClick={save}
            disabled={saving}
            className="press inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Track manager ────────────────────────────────────────────────────────────
function TrackManager({ tracks }: { tracks: AdminTrack[] }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);

  async function onUpload(file: File) {
    setAdding(true);
    const url = await uploadFile("audio", file);
    if (url) {
      const res = await addTrack({ title: file.name.replace(/\.[^.]+$/, ""), artist: "", url, coverUrl: "" });
      if (res.ok) {
        toast.success("Track added");
        router.refresh();
      } else toast.error(res.error ?? "Failed");
    }
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tracks ({tracks.length})</h3>
        <FilePick accept="audio/*" disabled={adding} onPick={onUpload}>
          <span className="press inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-white/5">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add track
          </span>
        </FilePick>
      </div>
      {tracks.length === 0 && <p className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">No tracks yet.</p>}
      {tracks.map((t) => (
        <TrackRow key={t.id} track={t} />
      ))}
    </div>
  );
}

function TrackRow({ track }: { track: AdminTrack }) {
  const router = useRouter();
  const [t, setT] = React.useState(track);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    const res = await updateTrack(t.id, { title: t.title, artist: t.artist, coverUrl: t.coverUrl });
    setBusy(false);
    res.ok ? toast.success("Track saved") : toast.error(res.error ?? "Failed");
  }
  async function remove() {
    if (!confirm(`Delete "${t.title}"?`)) return;
    setBusy(true);
    const res = await deleteTrack(t.id);
    setBusy(false);
    if (res.ok) { toast.success("Deleted"); router.refresh(); } else toast.error(res.error ?? "Failed");
  }

  return (
    <div className="rounded-xl border border-line bg-panel-2 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Text label="Title" value={t.title} onChange={(v) => setT({ ...t, title: v })} />
        <Text label="Artist" value={t.artist} onChange={(v) => setT({ ...t, artist: v })} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="truncate font-mono text-xs text-muted">{t.url}</span>
        <div className="flex gap-2">
          <button onClick={remove} disabled={busy} className="press inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button onClick={save} disabled={busy} className="press rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15">Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Social manager ─────────────────────────────────────────────────────────
function SocialManager({ socials }: { socials: AdminSocial[] }) {
  const router = useRouter();
  const [platform, setPlatform] = React.useState("discord");
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function add() {
    if (!url.trim()) return;
    setBusy(true);
    const res = await addSocial({ platform, url, label: "" });
    setBusy(false);
    if (res.ok) { toast.success("Link added"); setUrl(""); router.refresh(); } else toast.error(res.error ?? "Failed");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-line bg-panel-2 p-3">
        <div className="w-40">
          <Select label="Platform" value={platform} options={[...SOCIAL_PLATFORMS]} onChange={setPlatform} />
        </div>
        <div className="min-w-[200px] flex-1">
          <Text label="URL" value={url} onChange={setUrl} placeholder="https://…" />
        </div>
        <button onClick={add} disabled={busy} className="press inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: "#8b5cf6" }}>
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {socials.length === 0 && <p className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">No links yet.</p>}
      {socials.map((s) => (
        <SocialRow key={s.id} social={s} />
      ))}
    </div>
  );
}

function SocialRow({ social }: { social: AdminSocial }) {
  const router = useRouter();
  const [s, setS] = React.useState(social);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    const res = await updateSocial(s.id, { platform: s.platform, url: s.url, label: s.label });
    setBusy(false);
    res.ok ? toast.success("Saved") : toast.error(res.error ?? "Failed");
  }
  async function remove() {
    setBusy(true);
    const res = await deleteSocial(s.id);
    setBusy(false);
    if (res.ok) { toast.success("Removed"); router.refresh(); } else toast.error(res.error ?? "Failed");
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-line bg-panel-2 p-3">
      <div className="w-36">
        <Select label="Platform" value={s.platform} options={[...SOCIAL_PLATFORMS]} onChange={(v) => setS({ ...s, platform: v })} />
      </div>
      <div className="min-w-[180px] flex-1">
        <Text label="URL" value={s.url} onChange={(v) => setS({ ...s, url: v })} />
      </div>
      <div className="w-28">
        <Text label="Label" value={s.label} onChange={(v) => setS({ ...s, label: v })} />
      </div>
      <button onClick={save} disabled={busy} className="press rounded-lg bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/15">Save</button>
      <button onClick={remove} disabled={busy} className="press rounded-lg px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/10">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Primitive controls ─────────────────────────────────────────────────────
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {desc && <p className="mb-4 text-sm text-muted">{desc}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-medium text-muted">{children}</span>;
}
function Text({
  label, value, onChange, placeholder, mono, grow,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; grow?: boolean }) {
  return (
    <label className={grow ? "block flex-1" : "block"}>
      <Label>{label}</Label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm outline-none focus:border-white/30 ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}
function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm outline-none focus:border-white/30"
      />
    </label>
  );
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-line bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-28 rounded-lg border border-line bg-panel-2 px-2 py-2 font-mono text-xs outline-none focus:border-white/30" />
      </div>
    </label>
  );
}
function Range({
  label, value, min, max, step = 1, suffix, onChange,
}: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full cursor-pointer accent-[#8b5cf6]" />
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-left text-sm hover:bg-white/5"
    >
      <span>{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#8b5cf6]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm capitalize outline-none focus:border-white/30"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-panel capitalize">{o}</option>
        ))}
      </select>
    </label>
  );
}
function FilePick({
  accept, onPick, disabled, children,
}: { accept: string; onPick: (f: File) => void; disabled?: boolean; children: React.ReactNode }) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => ref.current?.click()}>{children}</button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
function UploadBtn({ kind, label, onDone }: { kind: "image" | "video" | "audio"; label: string; onDone: (url: string) => void }) {
  const [busy, setBusy] = React.useState(false);
  return (
    <FilePick
      accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : "audio/*"}
      disabled={busy}
      onPick={async (f) => {
        setBusy(true);
        const u = await uploadFile(kind, f);
        setBusy(false);
        if (u) { onDone(u); toast.success("Uploaded"); }
      }}
    >
      <span className="press inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-white/5">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {label}
      </span>
    </FilePick>
  );
}
function Avatar({ url, name }: { url: string; name: string }) {
  return (
    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-panel-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl font-bold">{(name || "?").slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}
