---
name: docs-summarize-pr
description: Generate a concise summary of a pull request
argument-hint: <diff> [context]
---

# docs-summarize-pr

Generate a concise summary of a pull request

## Variables

- `${input:diff:The git diff to summarize}` (required): The git diff to summarize
- `${input:context:Additional context about the PR}`: Additional context about the PR

## Rules

- Be concise but comprehensive.
- Highlight breaking changes prominently.
- Group related changes together.
- Use bullet points for clarity.

## Prompt

Analyze this pull request and provide a clear summary:

```diff
${input:diff:The git diff to summarize}
```

{{#context}}
Context: ${input:context:Additional context about the PR}
{{/context}}

Provide:
1. **Overview**: One-line summary of what this PR does
2. **Changes**: Bullet points of key changes
3. **Breaking Changes**: Any backward-incompatible changes (if any)
4. **Testing**: What testing was done or is needed
5. **Impact**: Areas of the codebase affected

Format as markdown suitable for a PR description.


