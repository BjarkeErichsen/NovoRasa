"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Molecule } from "@/lib/types";

// Lazy-load the 3D viewer to avoid SSR issues with Three.js
const MoleculeViewer = dynamic(() => import("@/components/MoleculeViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
      Loading viewer…
    </div>
  ),
});

interface MoleculesGridProps {
  molecules: Molecule[];
}

export default function MoleculesGrid({ molecules }: MoleculesGridProps) {
  const [selected, setSelected] = useState<Molecule | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* List */}
      <div className="space-y-2">
        {molecules.map((mol) => (
          <button
            key={mol.id}
            onClick={() => setSelected(mol)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              selected?.id === mol.id
                ? "border-indigo-500 bg-indigo-950"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-100">{mol.name}</span>
              {mol.is_universal && (
                <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                  universal
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {mol.atoms.length} atom{mol.atoms.length !== 1 ? "s" : ""}
              {" · "}
              {new Date(mol.created_at).toLocaleDateString()}
            </p>
            {mol.description && (
              <p className="mt-1 truncate text-xs text-zinc-400">{mol.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Viewer panel */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-800 px-5 py-4">
              <h3 className="font-medium text-zinc-100">{selected.name}</h3>
              {selected.description && (
                <p className="mt-0.5 text-xs text-zinc-400">{selected.description}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                {selected.atoms.length} atoms ·{" "}
                {[...new Set(selected.atoms.map((a) => a.type))].join(", ")}
              </p>
            </div>
            <div className="flex-1" style={{ minHeight: 400 }}>
              <MoleculeViewer
                molecule={selected}
                autoRotate
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-zinc-500">
            Select a molecule to view in 3D
          </div>
        )}
      </div>
    </div>
  );
}
