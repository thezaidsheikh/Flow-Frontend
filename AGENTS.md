# AGENTS.md

## Purpose
This file defines global engineering rules for AI coding assistants (Claude, Cursor, Windsurf, GitHub Copilot, etc.) working in this repository.

Always prefer consistency, maintainability, and production-grade quality over quick hacks.

Project: **Flow** - Workflow Automation Platform.

Stack:
- Java 21
- Spring Boot 3+
- PostgreSQL (JSONB)
- Redis
- Quartz Scheduler
- JWT Security
- Kong Gateway

---

# 1. Core Engineering Principles

## Always Optimize For
- Readability
- Simplicity
- Maintainability
- Testability
- Low coupling
- High cohesion
- Clear module boundaries
- Safe refactoring
- Production readiness

## Avoid
- God classes
- Tight coupling
- Hidden side effects
- Circular dependencies
- Premature optimization
- Reflection-heavy magic unless justified
- Static mutable state
- Business logic in controllers
- SQL inside controllers/services unless repository abstraction requires it

---

# 2. Coding Style

## Java Version
Use **Java 21** features where appropriate.

Preferred:
- records for immutable DTOs
- sealed classes where useful
- switch expressions
- Optional for return values only (not fields)
- Stream API when readable
- virtual threads only if intentionally introduced later

## Formatting
- 4-space indentation
- One public class per file
- Max method size: prefer < 40 lines
- Max class size: prefer focused responsibilities
- Blank lines between logical blocks
- Remove dead code immediately

## Comments
Only write comments when code intent is non-obvious.
Prefer self-explanatory names.

Bad:
```java
// increment i
i++;
```

Good:
```java
retryAttempt++;
```

---

# 3. Naming Rules

## Classes
Use PascalCase.

Examples:
- WorkflowService
- PublishWorkflowService
- JwtAuthenticationFilter
- WorkflowRunRepository

## Interfaces
Use descriptive names, forced `I` prefix.

Examples:
- NodeExecutor
- TokenProvider

## Methods
Use verbs.

Examples:
- createWorkflow()
- publishDraft()
- executeNode()
- validateGraph()

## Variables
Use meaningful camelCase.

Examples:
- workflowId
- publishedVersion
- executionContext

## Constants
UPPER_SNAKE_CASE.

Examples:
- MAX_RETRY_COUNT
- JWT_EXPIRY_MINUTES

## Packages
Lowercase singular by feature.

Examples:
- auth
- workflow
- execution
- credential

---

# 4. Architecture Constraints

## Architecture Style
Use **Modular Monolith**.
Organize by business domain, not technical layer only.

Top-level modules:
- auth
- workflow
- execution
- run
- credential
- connector
- notification
- common
- config

## Rules
- Modules communicate through services/events/interfaces.
- Avoid direct repository access across modules.
- Avoid cross-module entity mutation.
- No circular dependencies.
- Keep extraction path open for future microservices.

## Controllers Must Only Handle
- request validation
- auth context
- calling use-case service
- returning response

Controllers must NOT contain business logic.

---

# 5. Patterns To Follow

## Preferred Patterns

### Strategy Pattern
Use for node execution.

Examples:
- EmailNodeExecutor
  n- DelayNodeExecutor
- ConditionNodeExecutor

### Factory Pattern
Resolve executor by node type.

Example:
```java
nodeExecutorFactory.get(nodeSubType)
```

### Builder Pattern
Use for complex object creation.

### Adapter Pattern
Use for third-party integrations.

### Domain Events
Use for loose coupling.

Examples:
- WorkflowPublishedEvent
- WorkflowRunCompletedEvent

## Avoid Overusing Patterns
Do not add patterns only for theory.
Use only when they reduce complexity.

---

# 6. Services Guidelines

## Prefer Use-Case Services Over Giant Services
Preferred:
- CreateWorkflowService
- SaveDraftService
- PublishWorkflowService
- RunWorkflowService

Avoid:
- WorkflowService with 40 methods

## Service Rules
- One clear responsibility
- Constructor injection only
- Transaction boundary at service layer
- Validate business rules here
- Emit events after successful state changes

## Example
```java
@Service
@RequiredArgsConstructor
public class PublishWorkflowService {
   public void execute(UUID workflowId) {}
}
```

---

# 7. DTO Guidelines

## Use DTOs For API Boundaries
Never expose JPA entities directly in API responses.

## Request DTOs
Use validation annotations.

Example:
```java
public record CreateWorkflowRequest(
   @NotBlank String name,
   String description
) {}
```

## Response DTOs
Immutable and minimal.

Example:
```java
public record WorkflowResponse(
   UUID id,
   String name,
   String status
) {}
```

## Rules
- Separate request and response DTOs
- Never leak secrets
- Never return internal fields unless needed
- Use records where possible

---

# 8. Persistence Rules

## JPA / Hibernate
- Keep entities focused
- LAZY relationships by default
- Avoid EAGER fetching
- Use pagination for lists
- Use explicit queries when needed
- Use optimistic locking later if required

## PostgreSQL JSONB
Use for:
- node config
- graph metadata
- flexible schemas

Do NOT use JSONB when relational columns are clearer.

## Migrations
Use Flyway or Liquibase.
Never modify production schema manually.

---

# 9. Security Rules

- Use JWT access tokens
- Use refresh tokens if implemented
- BCrypt password hashing
- Encrypt credentials/secrets
- Validate ownership on every workflow resource
- Never trust client input
- Validate webhook secrets
- Sanitize logs
- Do not log tokens/passwords

---

# 10. Testing Rules

## Required Test Pyramid

### Unit Tests
For services, validators, executors.

### Integration Tests
For repositories, controllers, security, DB interactions.

### Minimal E2E
Critical workflow publish + run path.

## Naming
```text
shouldPublishWorkflowWhenDraftIsValid
shouldRejectUnauthorizedWorkflowAccess
```

## Rules
- Test behavior, not implementation details
- One assertion intent per test
- Use Testcontainers when practical
- Mock external integrations only

---

# 11. Error Handling

Use centralized exception handling.

Return standard contract:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

Never expose stack traces publicly.

---

# 12. Logging Rules

Use structured logs.
Include:
- requestId
- userId (if available)
- workflowId (if relevant)
- runId (if relevant)

Levels:
- INFO normal lifecycle
- WARN recoverable issues
- ERROR failures

Do not over-log hot paths.

---

# 13. Performance Rules

- Prefer pagination for all list APIs
- Avoid N+1 queries
- Cache read-heavy metadata in Redis
- Use async workers for workflow execution
- Never block request threads with long tasks
- Use Quartz for schedules

---

# 14. AI Assistant Behavior Rules

When generating code:
- Respect existing module boundaries
- Prefer modifying smallest surface area
- Preserve backward compatibility
- Add tests with new logic
- Reuse existing patterns before inventing new ones
- Ask before introducing new dependencies
- Keep methods small and readable
- Prefer composition over inheritance

When uncertain:
- choose simplest maintainable solution
- leave TODO with rationale if blocked

---

# 15. Future-Ready Constraints

Design current code so future additions are easy:
- teams/workspaces
- billing
- multiple drafts
- connector marketplace
- horizontal workers
- event bus extraction
- observability stack

Avoid decisions that block these paths.

---

# 16. Golden Rule

Write code as if another senior engineer will maintain it next week.
Clear > Clever.
Simple > Smart.
Reliable > Fancy.
