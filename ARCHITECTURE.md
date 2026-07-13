# Flow Architecture

## Purpose

This document describes the architecture that is implemented in the repository today. It is intentionally narrower than the long-term product vision and focuses on the modules, runtime behavior, and constraints of the current MVP.

## System shape

Flow is a modular Spring Boot monolith organized by domain:

```text
auth
workflow
execution
run
credential
connector
common
config
```

The application exposes a REST API and stores state in PostgreSQL.

## Module responsibilities

### `auth`

- User registration
- Password-based login
- JWT access token generation
- Refresh-token rotation
- Current-user lookup

### `workflow`

- Workflow ownership
- Draft graph persistence
- Publish validation
- Workflow read APIs

### `execution`

- Node execution strategies
- Input template resolution
- Manual workflow orchestration

### `run`

- Workflow run persistence
- Node-level execution logs
- Run query endpoints

### `credential`

- Encrypted secret storage
- Ownership-aware credential access

### `connector`

- Connector metadata catalog
- Provider adapter resolution
- Manual connector execution

### `common`

- Shared exceptions
- API response models
- JWT filter
- Current-user resolution

### `config`

- Security configuration
- Password encoder
- JWT properties
- environment loading

## Persistence model

### Core tables

- `users`
- `refresh_tokens`
- `workflows`
- `workflow_versions`
- `nodes`
- `edges`
- `credentials`
- `workflow_runs`
- `node_run_logs`

### Modeling choices

- IDs use UUID generation
- Node config and run payloads use PostgreSQL `jsonb`
- Workflow versions are stored separately from the workflow root
- Credentials store encrypted text instead of plaintext key/value rows

## Execution flow

Current execution is manual and synchronous.

```text
POST /workflows/{id}/run
-> load latest published version
-> create workflow_run row
-> execute nodes in-process
-> create node_run_logs per node
-> mark workflow_run completed or failed
```

## Graph rules

Current publish and runtime rules:

- at least one node is required
- exactly one trigger node is supported for manual execution
- edges must point to existing nodes
- only condition nodes may have multiple outgoing edges

## Supported node runtime semantics

### Trigger

- Starts the execution
- Emits the incoming `triggerData` payload

### Condition

- Reads from `trigger`, `variables`, or `previous`
- Supports `equals`, `not_equals`, and `exists`
- Chooses the next edge using `true` or `false` labels

### Action

- Resolves placeholders in config inputs
- Loads and decrypts the referenced credential
- Dispatches to a connector adapter

### Delay

- Persistable in the graph
- Not executable yet in the current runtime

## Connector architecture

Connectors follow an adapter pattern.

Implemented pieces:

- `IConnectorAdapter`
- `ConnectorRegistry`
- `ExecuteConnectorActionService`
- `GithubConnectorAdapter`

Current productionized action support is limited to GitHub pull-request creation.

## Security model

- Access tokens are signed with HMAC using Nimbus JOSE JWT
- Protected endpoints require `Authorization: Bearer <token>`
- Resource access is scoped by authenticated `userId`
- Refresh tokens are stored server-side and rotated on refresh
- Credential secrets are encrypted at rest with AES-GCM

## Operational behavior

### Profiles

- `dev` is the default Spring profile
- `.env` is loaded first
- `.env.dev` or `.env.prod` can override `.env`

### Schema management

- Hibernate currently runs with `ddl-auto=update` in development
- There is no migration tool wired in yet

### Health

- `GET /actuator/health`
- `GET /actuator/info`

## Design tradeoffs in the current MVP

- Manual execution is synchronous to keep the current codepath debuggable and small
- Delay nodes are rejected rather than silently ignored
- Workflow listing uses simple service composition instead of projection-heavy repository code
- Connector execution is provider-driven and intentionally narrow until more actions exist

## Planned next steps

These are not implemented yet:

- background workers
- scheduled and webhook triggers
- delay resume scheduling
- richer action-node catalog
- Flyway or Liquibase migrations
- OpenAPI generation
- run retries and backoff policies
