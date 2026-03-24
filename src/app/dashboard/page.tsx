import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import MoleculesGrid from "@/components/MoleculesGrid";
import type { Molecule } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch universal molecules + user's own molecules
  const { data, error } = await supabase
    .from("molecules")
    .select("*")
    .order("created_at", { ascending: false });

  const molecules: Molecule[] = data ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-50">
            NovoRasa
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-50">Molecules</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Your generated molecules and universal reference structures.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            Failed to load molecules: {error.message}
          </div>
        )}

        {molecules.length === 0 ? (
          <EmptyState />
        ) : (
          <MoleculesGrid molecules={molecules} />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-24 text-center">
      <div className="mb-3 text-4xl">⚗️</div>
      <h3 className="text-base font-medium text-zinc-300">No molecules yet</h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Once you generate molecules they will appear here. Universal reference
        molecules will show up once the database is seeded.
      </p>
    </div>
  );
}
