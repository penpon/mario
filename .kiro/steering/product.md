# Product Overview

This is a Super Mario Bros.-inspired 2D side-scrolling platformer game built entirely in the browser with no external game engine dependencies.

## Core Gameplay

- A player character moves left/right and jumps through a horizontally scrolling stage
- Enemies patrol platforms and can be defeated by stomping (jumping on top of them)
- Coins are scattered through the stage and award points when collected
- The goal is to reach the stage end (flag/goal) while managing limited lives

## Key Game Rules

- Player starts with 3 lives; losing all lives triggers game over
- Scoring: +100 for stomping an enemy, +50 for collecting a coin
- Player respawns at stage start after taking damage (with 2 seconds of invincibility)
- Stage clear takes priority over game over if both occur in the same frame
- Press R to restart from game over or stage clear screen (resets score to 0, lives to 3)

## Target Scope

Minimal viable single-stage game designed to be implemented in approximately one week. Focus is on core gameplay mechanics only — no power-ups, multi-stage progression, or sound.
