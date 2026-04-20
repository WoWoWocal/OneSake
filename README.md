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

OneSake Spickzettel
1) Projekt starten (Demo lokal)
Backend starten (ASP.NET Core)
cd backend\OneSake.Server
dotnet restore
dotnet run

Ausgabe zeigt dir die URL (z. B. http://localhost:5179)

Frontend starten (React + Vite)
cd frontend\web
npm install
npm run dev

Browser: http://localhost:5173

Frontend Build & Checks
cd frontend\web
npm run lint
npm run build
Backend Build & Tests
cd backend
dotnet build OneSake.sln -c Release
dotnet test OneSake.Tests\OneSake.Tests.csproj -c Release
2) Git Workflow (dev + main)
Tagesstart (immer so)
git checkout dev
git pull
Neuer Task (Feature-Branch von dev)
git checkout -b feature/<name>-<topic>
Änderungen speichern
git add .
git commit -m "feat: <kurzbeschreibung>"
git push -u origin feature/<name>-<topic>

➡️ Dann: Pull Request auf dev (nicht auf main)

dev → main “Release” (wenn dev stabil ist)
git checkout main
git pull
git merge origin/dev
git push

(oder PR dev→main auf GitHub, wenn ihr das lieber klickt)

Häufige Git Checks
git status
git branch
git remote -v
git log --oneline -10
Wenn du lokale Branches aufräumen willst
git branch -d feature/<name>-<topic>
git push origin --delete feature/<name>-<topic>
3) Wenn mal was hakt (Troubleshooting)
“Working tree clean, aber GitHub zeigt nix”
git push origin dev
git push origin main
“non-fast-forward” (Remote ist weiter)
git pull

Wenn Konflikte: erst lösen, dann git add, git commit, git push.

4) Super-kurzer “Alles läuft” Check
Backend dotnet run
Frontend npm run dev
Zwei Browserfenster öffnen → gleicher Room Code → Chat/Log testen
