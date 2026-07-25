# Git Branching Strategy

## Purpose

This document defines the Git branching workflow followed by the SIH26 engineering team. The goal is to keep development organised, minimise conflicts, and maintain a stable codebase.

---

# Branch Structure

```
main
│
├── develop
│
├── feature/<feature-name>
├── bugfix/<bug-name>
├── hotfix/<hotfix-name>
├── release/<version>
└── experiment/<experiment-name>
```

---

# Main Branch

**Branch:** `main`

## Purpose

- Stable and production-ready code.
- Always deployable.
- Protected branch.

## Rules

- No direct commits.
- Only merged through Pull Requests.
- Must pass all required checks.
- Must be reviewed before merging.

---

# Develop Branch

**Branch:** `develop`

## Purpose

- Integration branch.
- Contains completed features before release.

## Rules

- Developers create feature branches from `develop`.
- Merge feature branches back into `develop`.
- Keep `develop` stable.

---

# Feature Branches

Naming Convention

```
feature/<feature-name>
```

Examples

```
feature/login
feature/dashboard
feature/user-authentication
feature/model-training
feature/file-upload
```

## Rules

- Create from `develop`.
- One feature per branch.
- Delete after merging.

---

# Bug Fix Branches

Naming Convention

```
bugfix/<bug-name>
```

Examples

```
bugfix/login-error
bugfix/api-timeout
```

Purpose

Fix issues discovered during development.

---

# Hotfix Branches

Naming Convention

```
hotfix/<issue>
```

Examples

```
hotfix/security-patch
hotfix/server-crash
```

Purpose

Urgent fixes that cannot wait for the next release.

---

# Release Branches

Naming Convention

```
release/v1.0
release/v2.0
```

Purpose

Prepare the application for a release.

Activities include:

- Final testing
- Documentation
- Bug fixes
- Version updates

---

# Experimental Branches

Naming Convention

```
experiment/<idea>
```

Examples

```
experiment/llm
experiment/object-detection
experiment/rag
```

Purpose

Research and prototype new ideas without affecting the main development workflow.

---

# Workflow

```
Issue Created
      │
      ▼
Create Feature Branch
      │
      ▼
Develop Feature
      │
      ▼
Commit Changes
      │
      ▼
Push Branch
      │
      ▼
Create Pull Request
      │
      ▼
Code Review
      │
      ▼
Merge into Develop
      │
      ▼
Testing
      │
      ▼
Merge into Main
```

---

# Branch Protection Rules

The `main` branch must:

- Require Pull Requests.
- Require at least one review.
- Prevent force pushes.
- Prevent branch deletion.
- Require passing GitHub Actions checks before merging.

---

# Commit Frequency

Developers should:

- Commit small logical changes.
- Avoid huge commits.
- Push regularly.
- Keep branches up to date with `develop`.

---

# Best Practices

- One task per branch.
- Keep branch names meaningful.
- Delete merged branches.
- Rebase or merge from `develop` regularly.
- Never commit secrets or API keys.
- Keep commit history clean.

---

# Example Workflow

```
git checkout develop

git pull origin develop

git checkout -b feature/login

# Write code

git add .

git commit -m "feat: add login page"

git push origin feature/login

Create Pull Request

Review

Merge into develop
```

---

# Engineering Principle

Every change should be traceable, reviewable, and reversible. A clean Git history helps the team collaborate efficiently and makes debugging easier throughout the project lifecycle.
