---
name: docs-document-api
description: Generate comprehensive API documentation
argument-hint: <code> <language> [doc_style]
---

# docs-document-api

Generate comprehensive API documentation

## Variables

- `${input:code:The API code to document}` (required): The API code to document
- `${input:language:Programming language}` (required): Programming language
- `${input:doc_style:Documentation style (javadoc, sphinx, jsdoc, etc.)}`: Documentation style (javadoc, sphinx, jsdoc, etc.)

## Rules

- Document all public APIs.
- Include parameter types and return values.
- Provide usage examples.
- Document exceptions and error cases.
- Use consistent formatting.

## Prompt

Generate API documentation for this ${input:language:Programming language} code:

```${input:language:Programming language}
${input:code:The API code to document}
```

{{#doc_style}}
Use ${input:doc_style:Documentation style (javadoc, sphinx, jsdoc, etc.)} format.
{{/doc_style}}

Include:
- **Summary**: One-line description of what it does
- **Parameters**: Name, type, description for each parameter
- **Returns**: Type and description of return value
- **Raises/Throws**: Exceptions that can be thrown
- **Examples**: Practical usage examples with expected output
- **Notes**: Any important considerations or caveats
- **See Also**: Links to related functions/classes

Format the documentation according to the language standard:
- Python: Google/NumPy/Sphinx style docstrings
- Java/Kotlin: Javadoc/KDoc
- TypeScript/JavaScript: JSDoc/TSDoc
- Other: Follow language conventions


