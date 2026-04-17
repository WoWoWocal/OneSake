# Architecture

## Overview
OneSake is a browser-only PvP OPTCG simulator with real-time multiplayer capabilities.

## Components
- **Backend (ASP.NET Core)**: Handles game logic, SignalR hubs for real-time communication.
- **Frontend (React + Vite)**: Client-side UI for joining rooms, chatting, and viewing logs.
- **Shared DTOs**: TypeScript interfaces matching C# records for type safety.

## Design Principles
- Server-authoritative: All game state managed on server.
- Realtime via SignalR: Rooms for grouping players, broadcasts for chat and logs.
- Choice-driven: Future expansion for card choices and actions.

## Tech Stack
- Backend: C# .NET 8, SignalR
- Frontend: TypeScript, React, Vite
- Communication: WebSockets via SignalR