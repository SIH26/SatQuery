# Git Workflow

## Purpose

This document describes the Git workflow followed by the SIH26 engineering team. Every team member must follow this process to ensure clean collaboration and maintain a stable codebase.

---

# Development Workflow

Every task follows the lifecycle below.

```
Issue
    │
    ▼
Create Branch
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
Open Pull Request
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

# Starting a New Task

## 1. Update Local Repository

```bash
git checkout develop
git pull origin develop
```

---

## 2. Create a Feature Branch

```bash
git checkout -b feature/<feature-name>
```

Example

```bash
git checkout -b feature/login
```

---

# Working on the Feature

Commit regularly with meaningful messages.

Example

```bash
git add .
git commit -m "feat: add login page"
```

Avoid large commits containing unrelated changes.

---

# Pushing Changes

```bash
git push origin feature/login
```

---

# Creating a Pull Request

After pushing:

- Open GitHub.
- Create a Pull Request.
- Link the related issue.
- Request a review.
- Wait for approval before merging.

---

# Updating Your Branch

If `develop` has changed:

```bash
git checkout develop
git pull origin develop

git checkout feature/login

git merge develop
```

Resolve conflicts if necessary.

---

# Completing the Task

After approval:

- Merge into `develop`.
- Delete the feature branch.
- Close the related issue.

---

# Commit Message Convention

Use Conventional Commits.

## Feature

```
feat: add login page
```

## Bug Fix

```
fix: resolve authentication error
```

## Documentation

```
docs: update API documentation
```

## Refactor

```
refactor: simplify authentication service
```

## Performance

```
perf: optimise database queries
```

## Tests

```
test: add login API tests
```

## CI/CD

```
ci: configure GitHub Actions
```

---

# Pull Before You Push

Always run:

```bash
git pull origin develop
```

before pushing changes.

---

# Conflict Resolution

When conflicts occur:

- Read the conflicting code carefully.
- Discuss with the original contributor if needed.
- Test after resolving conflicts.
- Never remove code without understanding its purpose.

---

# Rules

- Never commit directly to `main`.
- Never force push to shared branches.
- One feature per branch.
- One Pull Request per logical task.
- Keep commits focused and meaningful.
- Review your own changes before requesting a review.

---

# Best Practices

- Commit early and often.
- Write clear commit messages.
- Keep branches short-lived.
- Ask for help when blocked.
- Keep documentation updated with code changes.

---

# Engineering Principle

Version control is more than storing code—it is a collaboration tool. Every commit should make the project easier to understand, review, and maintain.
