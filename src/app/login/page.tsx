import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { isDiscordConfigured } from "@/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="admin-scope grid min-h-screen place-items-center px-4">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center" style={{ ["--card-opacity" as string]: "0.6" }}>
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}>
          <span className="text-2xl">✦</span>
        </div>
        <h1 className="font-display text-2xl font-bold">skybio</h1>
        <p className="mt-1 text-sm text-muted">Owner sign-in</p>

        {isDiscordConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/admin" });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="press flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#5865F2" }}
            >
              Continue with Discord
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-xl border border-line bg-panel-2 p-3 text-xs text-muted">
            Discord OAuth isn&apos;t configured. Set <code className="font-mono">AUTH_DISCORD_ID</code> and{" "}
            <code className="font-mono">AUTH_DISCORD_SECRET</code> in your env.
          </p>
        )}

        <p className="mt-4 text-xs text-muted">
          Only the owner Discord account can access the admin.
        </p>
      </div>
    </div>
  );
}
