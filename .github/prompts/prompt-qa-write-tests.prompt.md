---
name: qa-write-tests
description: Generate comprehensive unit tests for given code
argument-hint: <code> <language> [test_framework]
---

# qa-write-tests

Generate comprehensive unit tests for given code

## Variables

- `${input:code:The code to test}` (required): The code to test
- `${input:language:Programming language}` (required): Programming language
- `${input:test_framework:Testing framework to use (e.g., pytest, junit, jest)}`: Testing framework to use (e.g., pytest, junit, jest)

## Rules

- Cover happy path, edge cases, and error conditions.
- Use descriptive test names that explain what is being tested.
- Keep tests independent and deterministic.
- Mock external dependencies.
- Aim for high code coverage but prioritize meaningful tests.

## Prompt

Write comprehensive unit tests for the following ${input:language:Programming language} code:

```${input:language:Programming language}
${input:code:The code to test}
```

{{#test_framework}}
Use ${input:test_framework:Testing framework to use (e.g., pytest, junit, jest)} as the testing framework.
{{/test_framework}}

Requirements:
- Test normal/expected inputs (happy path)
- Test edge cases (empty, null, boundary values)
- Test error conditions and exceptions
- Use clear, descriptive test names
- Include setup and teardown if needed
- Mock external dependencies
- Add comments for non-obvious test logic

{{> acceptance_criteria}}


