export interface Atom {
  type: string; // element symbol: 'C', 'H', 'O', 'N', 'F', etc.
  x: number;
  y: number;
  z: number;
}

export interface Molecule {
  id: string;
  name: string;
  atoms: Atom[];
  user_id: string | null; // null = universal molecule
  is_universal: boolean;
  created_at: string;
  description?: string;
}
