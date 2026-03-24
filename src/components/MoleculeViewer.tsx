"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { Atom, Molecule } from "@/lib/types";

// CPK color scheme (standard chemistry coloring)
const ELEMENT_COLORS: Record<string, string> = {
  H:  "#ffffff",
  C:  "#404040",
  N:  "#3050f8",
  O:  "#ff0d0d",
  F:  "#90e050",
  P:  "#ff8000",
  S:  "#ffff30",
  Cl: "#1ff01f",
  Br: "#a62929",
  I:  "#940094",
  default: "#ff69b4",
};

// Van der Waals radii (scaled down for display, in Å)
const ELEMENT_RADII: Record<string, number> = {
  H:  0.25,
  C:  0.40,
  N:  0.38,
  O:  0.36,
  F:  0.34,
  P:  0.52,
  S:  0.50,
  Cl: 0.49,
  Br: 0.55,
  I:  0.62,
  default: 0.40,
};

function getColor(type: string): string {
  return ELEMENT_COLORS[type] ?? ELEMENT_COLORS.default;
}

function getRadius(type: string): number {
  return ELEMENT_RADII[type] ?? ELEMENT_RADII.default;
}

// ──────────────────────────────────────────────────────────
// Bond between two atoms as a cylinder
// ──────────────────────────────────────────────────────────
function Bond({ a, b }: { a: Atom; b: Atom }) {
  const start = new THREE.Vector3(a.x, a.y, a.z);
  const end   = new THREE.Vector3(b.x, b.y, b.z);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const mid = start.clone().add(end).multiplyScalar(0.5);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return q;
  }, [direction]);

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.06, 0.06, length, 8]} />
      <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────
// Atom sphere
// ──────────────────────────────────────────────────────────
function AtomSphere({ atom }: { atom: Atom }) {
  const color  = getColor(atom.type);
  const radius = getRadius(atom.type);

  return (
    <mesh position={[atom.x, atom.y, atom.z]}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.05}
      />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────
// Infer bonds by distance threshold (simple covalent radii heuristic)
// ──────────────────────────────────────────────────────────
const COVALENT_RADII: Record<string, number> = {
  H: 0.31, C: 0.76, N: 0.71, O: 0.66, F: 0.57,
  P: 1.07, S: 1.05, Cl: 1.02, Br: 1.20, I: 1.39,
  default: 0.77,
};

function covalentRadius(type: string): number {
  return COVALENT_RADII[type] ?? COVALENT_RADII.default;
}

function inferBonds(atoms: Atom[]): [number, number][] {
  const bonds: [number, number][] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i], b = atoms[j];
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const threshold = (covalentRadius(a.type) + covalentRadius(b.type)) * 1.3;
      if (dist < threshold) bonds.push([i, j]);
    }
  }
  return bonds;
}

// ──────────────────────────────────────────────────────────
// Auto-rotating scene wrapper (optional)
// ──────────────────────────────────────────────────────────
function AutoRotate({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (enabled && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

// ──────────────────────────────────────────────────────────
// Main scene inside <Canvas>
// ──────────────────────────────────────────────────────────
function MoleculeScene({ molecule, autoRotate }: { molecule: Molecule; autoRotate: boolean }) {
  const bonds = useMemo(() => inferBonds(molecule.atoms), [molecule.atoms]);

  // Center molecule at origin
  const centered = useMemo(() => {
    if (molecule.atoms.length === 0) return [];
    const cx = molecule.atoms.reduce((s, a) => s + a.x, 0) / molecule.atoms.length;
    const cy = molecule.atoms.reduce((s, a) => s + a.y, 0) / molecule.atoms.length;
    const cz = molecule.atoms.reduce((s, a) => s + a.z, 0) / molecule.atoms.length;
    return molecule.atoms.map((a) => ({ ...a, x: a.x - cx, y: a.y - cy, z: a.z - cz }));
  }, [molecule.atoms]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, -3, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#aaddff" />

      <AutoRotate enabled={autoRotate}>
        {centered.map((atom, i) => (
          <AtomSphere key={i} atom={atom} />
        ))}
        {bonds.map(([i, j], idx) => (
          <Bond key={idx} a={centered[i]} b={centered[j]} />
        ))}
      </AutoRotate>

      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Public component
// ──────────────────────────────────────────────────────────
interface MoleculeViewerProps {
  molecule: Molecule;
  autoRotate?: boolean;
  className?: string;
}

export default function MoleculeViewer({
  molecule,
  autoRotate = true,
  className = "",
}: MoleculeViewerProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <MoleculeScene molecule={molecule} autoRotate={autoRotate} />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
        {[...new Set(molecule.atoms.map((a) => a.type))].map((type) => (
          <span
            key={type}
            className="flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-mono text-zinc-300"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-zinc-600"
              style={{ background: getColor(type) }}
            />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
