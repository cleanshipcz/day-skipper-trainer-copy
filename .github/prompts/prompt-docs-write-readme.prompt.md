---
name: docs-write-readme
description: Create a comprehensive README.md for a project
argument-hint: <project_name> <project_description> [tech_stack] [installation_steps] [usage_examples]
---

# docs-write-readme

Create a comprehensive README.md for a project

## Variables

- `${input:project_name:Name of the project}` (required): Name of the project
- `${input:project_description:What the project does}` (required): What the project does
- `${input:tech_stack:Technologies used}`: Technologies used
- `${input:installation_steps:How to install/setup}`: How to install/setup
- `${input:usage_examples:How to use the project}`: How to use the project

## Rules

- Start with a clear project description.
- Include installation instructions.
- Provide usage examples.
- Add badges for build status, coverage, etc.
- Include contributing guidelines reference.

## Prompt

Create a README.md for the project "${input:project_name:Name of the project}":

Description: ${input:project_description:What the project does}

{{#tech_stack}}
Tech stack: ${input:tech_stack:Technologies used}
{{/tech_stack}}

{{#installation_steps}}
Installation: ${input:installation_steps:How to install/setup}
{{/installation_steps}}

{{#usage_examples}}
Usage: ${input:usage_examples:How to use the project}
{{/usage_examples}}

Include these sections:
1. **Project Title and Description**: Clear overview with badges
2. **Features**: Key capabilities and highlights
3. **Prerequisites**: Required tools and versions
4. **Installation**: Step-by-step setup instructions
5. **Usage**: Quick start and common use cases with examples
6. **Configuration**: Environment variables and config options
7. **API Reference**: Link to detailed API docs (if applicable)
8. **Contributing**: How to contribute (link to CONTRIBUTING.md)
9. **Testing**: How to run tests
10. **License**: License information
11. **Authors/Maintainers**: Credits
12. **Acknowledgments**: Dependencies and inspiration

Use proper markdown formatting with code blocks, lists, and links.


