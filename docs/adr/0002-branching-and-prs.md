# 0002 - Branching and Pull Requests

## Status

Accepted

## Context

Das Team arbeitet parallel an Backend, Frontend und Dokumentation. Direkte Änderungen auf `main` erhöhen das Risiko instabiler Integrationen und unbeabsichtigter Regressionen.

## Decision

- `main` wird als geschützter stabiler Branch behandelt.
- Direkte Pushes auf `main` werden in GitHub per Branch Protection deaktiviert.
- Änderungen erfolgen über Feature/Fix/Docs-Branches und Pull Requests.
- Jeder PR benötigt mindestens 1 Approval.
- CI-Checks (Backend Build/Test und Frontend Build) sind vor Merge verpflichtend.

## Consequences

### Positive

- Höhere Stabilität auf `main`
- Frühzeitiges Feedback durch Reviews
- Einheitliche Qualitätskontrolle durch CI

### Negative

- Leicht erhöhter Prozessaufwand für kleine Änderungen
- Disziplin bei Branch-Pflege und PR-Beschreibung erforderlich
