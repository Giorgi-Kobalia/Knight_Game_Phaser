# Knight Game — Phaser 3

A side-scrolling action game built with **Phaser 3**, **TypeScript**, and **Vite**.

## Gameplay

You play as a knight standing at the center of the screen. The world scrolls around you as you move. Survive as long as possible by defeating waves of enemies and defending with your shield.

**Controls**

| Key | Action |
|-----|--------|
| `A` | Move left |
| `D` | Move right |
| `Space` | Attack |
| `Shift` | Block with shield |

## Enemies

| Enemy | Score | Description |
|-------|-------|-------------|
| Ronin | +1 | Fast melee fighter, unlocked from the start |
| Archer | +2 | Shoots arrows from range, unlocked at score 5 |
| Necromancer | +3 | Launches skulls from distance, unlocked at score 10 |
| Paladin | +4 | Armored boss with 2 HP, unlocked at score 20 |

Enemy spawn rate increases as your score grows, reaching maximum difficulty at score 40.

## Features

- Parallax background with 12 independent scroll layers
- Lives system — 3 HP with invincibility frames after taking damage
- Shield blocks melee hits and projectiles (arrows, skulls)
- Physical collision — enemies push back against the knight
- Score popups on kill, high score saved to `localStorage`
- Unlock banners when new enemy types enter the arena
- Adaptive spawn rate scaling with score

## Tech Stack

- [Phaser 3](https://phaser.io/) v3.88.2
- TypeScript ~5.7.2
- Vite v6.2.0

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```
