# OneSake

Browser-only OPTCG PvP Simulator (server-authoritative, choice-driven)  
Tech: ASP.NET Core (C#) + PostgreSQL + React/TypeScript

## Dev
### Backend
cd backend\\OneSake.Server
dotnet run

### Frontend
cd frontend\\web
npm install
npm run dev

## Workflow (dev + main)
1. `git checkout dev && git pull`
2. Create a feature branch from `dev` (`feature/...`, `fix/...`, `docs/...`)
3. Commit and push your branch
4. Open a pull request to `dev`
5. Test `dev` regularly and keep CI green
6. When `dev` is stable, open a pull request from `dev` to `main`
