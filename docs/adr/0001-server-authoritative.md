# ADR 0001: Server-Authoritative Architecture

## Status
Accepted

## Context
For a fair PvP game, all game state must be managed server-side to prevent cheating.

## Decision
Adopt server-authoritative model where client sends actions, server validates and broadcasts state changes.

## Consequences
- Prevents client-side manipulation.
- Requires real-time communication (SignalR).
- Increases server load but ensures integrity.