---
name: refactor-add-error-handling
description: Add comprehensive error handling and validation
argument-hint: <code> <language>
---

# refactor-add-error-handling

Add comprehensive error handling and validation

## Variables

- `${input:code:The code needing error handling}` (required): The code needing error handling
- `${input:language:Programming language of the code}` (required): Programming language of the code

## Rules

- Handle expected error cases explicitly.
- Use language-specific error handling patterns.
- Validate inputs at boundaries.
- Provide helpful error messages.
- Clean up resources properly (try-finally, context managers).

## Prompt

Add proper error handling to this ${input:language:Programming language of the code} code:

```${input:language:Programming language of the code}
${input:code:The code needing error handling}
```

Consider these error scenarios:
- Invalid input parameters
- Null/None values
- Resource unavailability (files, network, database)
- Boundary conditions (empty collections, overflow)
- Concurrent access issues
- External service failures

Apply these patterns:
- Input validation at function boundaries
- Use Result types or exceptions appropriately
- Provide context in error messages
- Clean up resources (RAII, try-finally, context managers)
- Fail fast for programming errors
- Handle expected errors gracefully

Provide:
1. **Refactored Code**: With comprehensive error handling
2. **Error Cases**: List of scenarios handled
3. **Error Messages**: Clear, actionable messages

{{> constraints}}


