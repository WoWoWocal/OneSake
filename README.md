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


Backend starten

cd backend\OneSake.Server
dotnet restore
dotnet run

Frontend starten

cd frontend\web
npm install
npm run dev

Frontend prüfen

cd frontend\web
npm run lint
npm run build

Backend prüfen

cd backend
dotnet build OneSake.sln -c Release
dotnet test OneSake.Tests\OneSake.Tests.csproj -c Release

###Spickzettel

Täglicher Git-Workflow auf dev

git checkout dev
git pull origin dev

Änderungen committen und auf dev pushen

git push origin dev<img width="566" height="778" alt="grafik" src="https://github.com/user-attachments/assets/f0d52821-176b-4da9-bdf1-322d97498aad" />

