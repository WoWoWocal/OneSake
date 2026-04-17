# OneSake PvP OPTCG Simulator

Browser-only real-time PvP OPTCG game.

## Quick Start

### Backend
```bash
cd backend
dotnet run --project OneSake.Server
```
Runs on http://localhost:5179

### Frontend
```bash
cd frontend/web
npm install
npm run dev
```
Runs on http://localhost:5173

### Test
1. Open two browser tabs to http://localhost:5173
2. Enter same room code (e.g., "testroom") and join.
3. Chat messages and join events should appear in both tabs.

## Architecture
See [docs/architecture.md](docs/architecture.md)

## API
See [docs/api-contract.md](docs/api-contract.md)