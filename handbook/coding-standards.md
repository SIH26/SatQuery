# Coding Standards

## Purpose

This document defines the coding standards followed by the SIH26 engineering team. These guidelines ensure that the codebase remains clean, maintainable, readable, and easy to collaborate on.

---

# Engineering Principles

Every piece of code should be:

- Correct
- Readable
- Maintainable
- Testable
- Reusable
- Secure
- Well documented

Always optimise for readability before optimisation.

---

# General Guidelines

## Write Clean Code

- Use meaningful names.
- Keep functions small.
- Avoid duplicate code.
- Remove dead code.
- Avoid unnecessary complexity.

Good code should be understandable without requiring extensive comments.

---

# Naming Conventions

## Variables

Use descriptive names.

✅ Good

```text
userProfile
totalAmount
predictionResult
```

❌ Bad

```text
x
temp
abc
data1
```

---

## Functions

Functions should describe an action.

Examples

```text
calculateScore()
validateInput()
predictDisease()
sendNotification()
```

---

## Classes

Use PascalCase.

Examples

```text
UserService
PredictionEngine
AuthenticationManager
```

---

## Constants

Use uppercase.

Example

```text
MAX_FILE_SIZE
DEFAULT_TIMEOUT
```

---

# Function Design

Functions should:

- Perform one task.
- Have clear input and output.
- Avoid unnecessary side effects.
- Be easy to test.

---

# File Organisation

Keep related files together.

Example

```text
backend/
frontend/
docs/
tests/
config/
```

---

# Error Handling

Do not ignore errors.

Always:

- Handle exceptions gracefully.
- Return meaningful error messages.
- Log unexpected failures.
- Avoid exposing sensitive information.

---

# Comments

Write comments only when necessary.

Comments should explain:

- Why something exists.
- Why a decision was made.

Do not comment obvious code.

---

# Documentation

Public functions, APIs, and important modules should include documentation.

Documentation should explain:

- Purpose
- Inputs
- Outputs
- Possible errors

---

# Logging

Log meaningful information.

Examples:

- Application startup
- Important events
- Errors
- Warnings

Never log:

- Passwords
- API keys
- Tokens
- Personal information

---

# Security

Never commit:

- API keys
- Passwords
- Secrets
- Private certificates
- Environment files containing secrets

Always use environment variables.

---

# Git Standards

Every commit should represent one logical change.

Use Conventional Commits.

Examples

```text
feat: add login page

fix: resolve authentication issue

docs: update architecture

refactor: simplify API service

test: add unit tests

ci: configure GitHub Actions
```

---

# Code Reviews

Every Pull Request should be reviewed for:

- Correctness
- Readability
- Performance
- Security
- Documentation

Feedback should be respectful and constructive.

---

# Testing

Before submitting code:

- Verify it works.
- Test edge cases.
- Ensure existing functionality is not broken.
- Fix compiler or linting errors.

---

# Performance

Optimise only after correctness.

Avoid:

- Premature optimisation
- Unnecessary loops
- Duplicate database queries
- Excessive API calls

---

# AI Development Standards

When building AI features:

- Track datasets used.
- Document model versions.
- Record evaluation metrics.
- Make experiments reproducible.
- Save model configuration.

---

# Documentation Standards

Every major feature should include:

- Purpose
- Architecture
- Usage
- Limitations
- Future improvements

---

# Engineering Values

Every engineer should strive for:

- Quality over speed
- Simplicity over complexity
- Collaboration over competition
- Learning over ego
- Ownership over excuses

---

# Final Principle

Write code as if another engineer will maintain it tomorrow. Good engineering is measured not only by working software, but also by how easy it is for others to understand, improve, and maintain.
