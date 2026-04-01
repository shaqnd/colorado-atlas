# Migration From Claude Code

## Goal

Move the existing Claude Code project into this repository without losing history, structure, or important context.

## Recommended Process

1. Identify the folder that contains the real source code and support files.
2. Separate source code from generated outputs, caches, virtual environments, and local databases.
3. Copy application code, config, prompts, migrations, schemas, tests, and small reference data into this repo.
4. Keep large raw datasets, exports, and secrets out of git unless there is a strong reason to version them.
5. Add or refine stack-specific ignore rules once the app framework is imported.
6. Commit the migration as one intentional baseline commit before making feature changes.

## What Usually Belongs In Git

- Source code
- Infrastructure and deployment config
- Database migrations and schemas
- Prompt templates and agent instructions
- Tests
- Small seed data and fixtures
- Project documentation

## What Usually Stays Out Of Git

- Secrets and `.env` files
- Build outputs
- Dependency directories
- Virtual environments
- Large exports and raw datasets
- Local SQLite databases unless intentionally versioned

## If Claude Work Exists Only In Chat

If the code only exists in Claude transcripts, export or copy it into a real local project folder first. Once that folder exists, Codex can help normalize the structure and commit it properly.

