# ADR 0003: Adopt dev+main workflow

- Status: Accepted
- Date: 2026-04-21

## Context

The team needs a simple workflow that supports daily integration work while keeping a stable branch for demos and milestone releases.

## Decision

Adopt a two-branch workflow:

- `main` is stable and demo-ready.
- `dev` is the integration branch.
- Feature branches start from `dev` and merge into `dev`.
- When `dev` is stable, create a PR from `dev` to `main`.
- No mandatory rebase policy. Merge and squash merge are allowed.

## Consequences

- Day-to-day integration happens on `dev`.
- `main` stays cleaner and safer for demos.
- Release cadence is explicit via `dev` to `main` PRs.
- Team onboarding is easier because the model is simple.
