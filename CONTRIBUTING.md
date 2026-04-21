# Contributing to OneSake

Thanks for contributing.

## Branch Model

- `main` = stable, demo-ready
- `dev` = integration branch
- Do not work directly on `main` or `dev`

Create topic branches from `dev`:

- `feature/<name>-<topic>`
- `fix/<topic>`
- `docs/<topic>`

## Pull Request Target

- Default target branch for pull requests is `dev`.
- Only release or milestone pull requests go from `dev` to `main`.

## Pull Request Rules

- Keep PRs small and focused.
- Include a "How to test" section in each PR.
- Link related issues when available.

## Commit Convention

Use clear commit prefixes:

- `feat:`
- `fix:`
- `docs:`
- `chore:`

## ADR Process

Architectural decisions are documented in `docs/adr/XXXX-*.md`.
