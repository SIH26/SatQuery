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

Urgent fixes that cannot wait for the next release
