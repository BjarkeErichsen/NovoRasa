# NovoRasa — Project Intentions

## What is this?

NovoRasa is a web application for **inverse molecular design** — a process where you specify desired properties of a molecule and let a machine learning model generate candidate structures that satisfy those conditions.

The name reflects the goal: generating novel (*novo*) molecular structures (*rasa* — a blank slate, shaped by constraints).

---

## Purpose

To provide a clean, fun, and genuinely useful interface for interacting with inverse design models and evaluating their outputs. Every user has a persistent account, and all generated molecules accumulate over time — building a personal library of design runs and results.

---

## Core User Flows

### 1. Account & Authentication
- Users sign up and log in via **Supabase Auth**
- Each account is isolated — molecules and runs are private to the user
- Data persists indefinitely; each session adds to the user's history

### 2. Molecule Generation
A clean, guided workflow:
1. **Select a model** — choose which inverse design model to run
2. **Set conditionals** — specify the desired molecular properties (e.g. HOMO-LUMO gap, dipole moment, solubility)
3. **Run generation** — submit the job to the ML backend
4. **Auto-save** — generated molecules are automatically stored to the user's profile upon completion

### 3. Exploration & Visualization
- Browse all previously generated molecules from your profile
- **3D interactive viewer** for each molecule — rotate, zoom, inspect from any angle
- Multiple visualization toggles (e.g. ball-and-stick, surface, electrostatic potential)
- Side-by-side **molecule comparison**
- **Nearest neighbor search** — find the closest match to a generated molecule in the QM9 dataset (or other reference sets)

---

## Molecule Scope

By default, molecules will be drawn from the distribution of the **QM9 dataset** — small organic molecules (up to ~9 heavy atoms of C, H, O, N, F). This keeps the 3D visualization lightweight and the generation models tractable. Larger molecules may be supported in the future as new models are integrated.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend & hosting | [Vercel](https://vercel.com) |
| Auth & database | [Supabase](https://supabase.com) |
| ML inference backend | Separate server (cloud or HPC — TBD) |

The web application handles UI, user state, and molecule storage. The heavy machine learning inference runs on a dedicated backend, decoupled from the frontend deployment. This separation keeps the Vercel deployment lightweight while allowing the ML layer to scale independently.

---

## Key Design Principles

- **Clean UI first** — the interface should be intuitive and visually polished
- **Persistence by default** — every run is saved automatically; nothing is lost
- **Interactivity** — 3D visualization is not an afterthought; it is central to how results are evaluated
- **Extensibility** — the architecture should make it straightforward to add new models, new datasets, and new property conditionals over time

---

## Status

Early-stage. The repository is being set up. Core infrastructure (auth, database schema, frontend scaffold) comes first; ML backend integration follows.
