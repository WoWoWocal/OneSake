# Team Workflow

## Branching

- `main` bleibt stabil und releasbar.
- Entwicklung erfolgt ausschließlich über Branches:
  - `feature/<name>-<topic>`
  - `fix/<topic>`
  - `docs/<topic>`

## PR Flow

1. Branch von aktuellem `main` erstellen.
2. Änderungen committen und pushen.
3. Pull Request gegen `main` öffnen.
4. Mindestens 1 Review abwarten.
5. CI muss grün sein (Backend + Frontend Build/Test).
6. Danach mergen.

## CI

Die Pipeline führt aus:

- Backend: `dotnet restore`, `dotnet build`, `dotnet test`
- Frontend: `npm ci`, `npm run build`

## Rebase vs Merge

- Rebase ist optional, hält die Historie linear.
- Merge ist erlaubt, wenn dadurch Konflikte klarer aufgelöst werden.

## Konfliktlösung

- Regelmäßig `main` in den Feature-Branch integrieren.
- Konflikte lokal lösen und anschließend erneut testen.
- Bei größeren Konflikten Pair-Review im PR nutzen.
