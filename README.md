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
2. Commit and push your branch
3. Open a pull request to `dev`
4. Test `dev` regularly and keep CI green
5. When `dev` is stable, open a pull request from `dev` to `main`
