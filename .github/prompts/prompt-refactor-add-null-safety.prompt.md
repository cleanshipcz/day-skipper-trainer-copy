---
name: refactor-add-null-safety
description: Add null safety checks to code that may have null pointer issues
argument-hint: <code> <language>
---

# refactor-add-null-safety

Add null safety checks to code that may have null pointer issues

## Variables

- `${input:code:The code to make null-safe}` (required): The code to make null-safe
- `${input:language:Programming language}` (required): Programming language

## Rules

- Use language-appropriate null safety patterns.
- Prefer optional chaining or safe calls over explicit null checks.
- Consider using nullable types where appropriate.
- Add tests covering null cases.

## Prompt

Analyze the following ${input:language:Programming language} code for potential null pointer issues and add appropriate null safety:

```${input:language:Programming language}
${input:code:The code to make null-safe}
```

Tasks:
1. Identify all places where null/undefined could cause issues
2. Add appropriate null checks or safe navigation
3. Use language idioms (e.g., Kotlin's `?.`, Python's `Optional`, etc.)
4. Consider returning early with null checks where appropriate
5. Add defensive assertions if needed

{{> constraints}}
{{> acceptance_criteria}}


