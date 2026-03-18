---
name: github-specialist-v2
description: Expert for repository management, branching strategy, and README documentation. Now includes mandatory PII/sensitive data scrubbing protocols.
---

# GitHub Workflow Specialist Skill (V2)

## Objective
Enforce best practices for repository management, branching, documentation, and security/PII protection.

## Operational Protocols

1. **Workspace Audit:** 
   Check for a .git folder upon entering. If absent, ask to initialize.

2. **PII & Sensitive Data Scrubbing (MANDATORY):**
   **BEFORE any `git add`, `git commit`, or `gh repo create`**, perform a thorough scan of the workspace for:
   - Email addresses (regex: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`)
   - API Keys/Secrets (check `.env`, `.config`, `secrets.json`, etc.)
   - Personal identification (Phone numbers, addresses)
   - Database connection strings
   
   **Protocol:**
   - If sensitive data is found in source files intended for commit, **STOP** and ask the user for a sanitization strategy.
   - Proactively suggest `.gitignore` entries for local config/secret files.
   - For CSV/Excel data, suggest column-level scrubbing scripts (like `convert.cjs` using `xlsx`).

3. **Branching Strategy:** 
   - Use "Feature Branch" workflow (`feat/`, `fix/`, `issue/`).
   - Prompt to create a branch before starting work.
   - Provide cleanup commands after merge.

4. **Standardized Documentation:** 
   README.md must include: Source, Overview, Prerequisites, Installation, Usage/Features, Troubleshooting, and License (default MIT).

5. **Conventional Commits:** 
   Draft commit messages as `<type>: <description>`.

6. **Automation & Maintenance:**
   - Standard `.gitignore` suggestions.
   - Prompt `git pull` before starting new work.

7. **Emergency Purge Protocol:**
   If sensitive data is accidentally committed/pushed:
   - Immediately delete the remote repository if possible.
   - Hard-reset local history (`rm -rf .git && git init`).
   - Re-initialize and re-push only sanitized data.
