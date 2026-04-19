# Contributing to OneSake

Vielen Dank für deinen Beitrag zu OneSake.

## Branch Naming

Bitte arbeite **nicht direkt auf `main`**. Verwende stattdessen:

- `feature/<name>-<topic>`
- `fix/<topic>`
- `docs/<topic>`

Beispiele:

- `feature/tino-matchmaking`
- `fix/login-timeout`
- `docs/team-workflow`

## Pull-Request Regeln

- Erstelle kleine, fokussierte PRs.
- Jeder PR benötigt mindestens **1 Review** vor dem Merge.
- Füge im PR zwingend einen Abschnitt **"How to test"** hinzu.
- Verlinke zugehörige Issues (falls vorhanden).

## Commit-Konvention

Nutze prägnante Commit-Messages mit Prefix:

- `feat:` neue Funktionalität
- `fix:` Bugfix
- `docs:` Dokumentationsänderungen
- `chore:` Wartung/Tooling/CI

Beispiel: `feat: add room reconnect handling`

## Konflikt-Minimierung

- Vor Arbeitsbeginn: `git pull` auf aktuellem Stand.
- Halte deinen Feature-Branch aktuell.
- Rebase ist optional, aber empfohlen für lineare Historie.

## Release-Strategie

- `main` ist immer der stabile Stand.
- Releases werden aus `main` erzeugt.

## ADR-Prozess

Neue Architekturentscheidungen werden als ADR dokumentiert unter:

- `docs/adr/XXXX-*.md`

Vergib fortlaufende Nummern (`0001`, `0002`, ...), beschreibe Kontext, Entscheidung und Konsequenzen.
