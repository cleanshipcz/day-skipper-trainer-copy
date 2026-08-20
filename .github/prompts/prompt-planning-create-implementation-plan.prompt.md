---
name: planning-create-implementation-plan
description: Break down a project into phases with tasks and timeline
argument-hint: <project> [team_size] [timeline] [priorities]
---

# planning-create-implementation-plan

Break down a project into phases with tasks and timeline

## Variables

- `${input:project:Project description}` (required): Project description
- `${input:team_size:Number of developers}`: Number of developers
- `${input:timeline:Desired completion timeline}`: Desired completion timeline
- `${input:priorities:Must-have vs nice-to-have features}`: Must-have vs nice-to-have features

## Rules

- Break work into manageable phases.
- Identify dependencies between tasks.
- Be realistic about estimates.
- Plan for testing and iteration.

## Prompt

Create implementation plan for:

Project: ${input:project:Project description}

{{#team_size}}
Team size: ${input:team_size:Number of developers} developers
{{/team_size}}

{{#timeline}}
Timeline: ${input:timeline:Desired completion timeline}
{{/timeline}}

{{#priorities}}
Priorities: ${input:priorities:Must-have vs nice-to-have features}
{{/priorities}}

Provide:

1. **Project Overview**: Summary and goals

2. **Phases**: Break project into logical phases
   - Phase 1: Foundation (core functionality)
   - Phase 2: Features (main capabilities)
   - Phase 3: Polish (UX, performance, docs)

3. **Task Breakdown**: For each phase:
   - Specific tasks with descriptions
   - Estimated effort (story points or hours)
   - Dependencies on other tasks
   - Required skills/expertise

4. **Timeline**: 
   - Gantt chart or phase timeline
   - Key milestones
   - Deliverables at each milestone

5. **Critical Path**: Tasks that could block progress

6. **Risk Management**:
   - Technical risks
   - Resource risks
   - Mitigation strategies

7. **Testing Strategy**: When and how testing happens

8. **Deployment Plan**: How to roll out incrementally

9. **Success Metrics**: How to measure completion and quality


