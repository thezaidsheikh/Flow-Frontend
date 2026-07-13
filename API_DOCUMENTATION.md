# Flow API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:3002/api/v1`  
> **Content-Type:** `application/json`  
> **Authentication:** JWT Bearer Token  
> **Status:** Active (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Envelope](#response-envelope)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Auth](#1-auth)
   - [Workflows](#2-workflows)
   - [Runs](#3-runs)
   - [Connectors](#4-connectors)
   - [Credentials](#5-credentials)
   - [Actuator](#6-actuator)
6. [Enums Reference](#enums-reference)

---

## Overview

Flow is a workflow automation platform. This API enables you to:

- Register and authenticate users
- Create, edit, and publish visual workflows
- Execute workflows and monitor their runs
- Manage connector integrations (e.g., GitHub, Slack)
- Store and encrypt credentials for external services

### Key Conventions

| Convention | Detail |
|---|---|
| All JSON fields | `snake_case` (enforced globally via Jackson) |
| IDs | UUID strings (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`) |
| Timestamps | ISO-8601 `OffsetDateTime` (e.g. `"2026-07-12T11:33:21.548+05:30"`) |
| Pagination | 0-based page index, default size 20, max 100 |
| Status codes | `200` OK, `201` Created, `400` Validation, `401` Unauthorized, `404` Not Found, `500` Server Error |

---

## Authentication

### JWT Token Flow

```
Register/Login  -->  Receive Access Token + Refresh Token
                         |
                         v
Every Protected Request -->  Authorization: Bearer <access_token>
                         |
                         v
Token Expired?  -->  POST /auth/refresh with refresh_token  -->  New tokens
```

- **Access Token:** Short-lived (configurable, default 1 hour). Sent in `Authorization` header.
- **Refresh Token:** Long-lived. Used to obtain new access tokens.
- **Token Type:** Always `Bearer`
- **Stateless:** No server-side sessions. Every request is independently authenticated.

### Public Endpoints (No Token Required)

| Endpoint |
|---|
| `POST /auth/register` |
| `POST /auth/login` |
| `POST /auth/refresh` |
| `GET /actuator/health` |
| `GET /actuator/info` |

### Protected Endpoints (Token Required)

All other endpoints require the `Authorization: Bearer <token>` header.

---

## Response Envelope

Every API response (success and error) is wrapped in a consistent envelope.

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow created successfully",
  "data": { ... },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Always `true` for successful responses |
| `statusCode` | int | HTTP status code |
| `message` | string | Human-readable message |
| `data` | object/array/null | The actual response payload |
| `meta` | object/null | Metadata (e.g. pagination info) |
| `timestamp` | string | ISO-8601 timestamp of when the response was generated |
| `path` | string | Request path |
| `requestId` | string | Unique request identifier for tracing |

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Email should be valid",
      "password": "Password is required"
    }
  },
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/auth/register",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Always `false` for error responses |
| `statusCode` | int | HTTP status code |
| `message` | string | Human-readable error summary |
| `error.code` | string | Machine-readable error code |
| `error.details` | object/string | Field-level errors or additional context |
| `timestamp` | string | ISO-8601 timestamp |
| `path` | string | Request path |
| `requestId` | string | Unique request identifier |

---

## Error Handling

### Error Codes

| HTTP Status | Error Code | When |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request body fails validation (field-level details provided) |
| `400` | `BAD_REQUEST` | Malformed or semantically invalid request |
| `401` | `UNAUTHORIZED` | Missing, invalid, or expired JWT token |
| `404` | `NOT_FOUND` | Requested resource does not exist |
| `409` | `CONFLICT` | Resource already exists (e.g. duplicate email) |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server failure |

### Validation Error Details Format

When `VALIDATION_ERROR` occurs, `error.details` is a map of field name to error message:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Email should be valid",
      "firstName": "First name is required",
      "name": "Name must not exceed 255 characters"
    }
  }
}
```

---

## API Endpoints

---

### 1. Auth

#### 1.1 Register User

Create a new user account.

```
POST /api/v1/auth/register
```

**Authentication:** Not required

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `email` | string | Yes | `@NotBlank`, `@Email` | User's email address |
| `password` | string | Yes | `@NotBlank` | User's password |
| `first_name` | string | Yes | `@NotBlank` | User's first name |
| `last_name` | string | Yes | `@NotBlank` | User's last name |

**Request Example:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "ACTIVE"
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/auth/register",
  "requestId": "req-uuid-here"
}
```

---

#### 1.2 Login

Authenticate and receive JWT tokens.

```
POST /api/v1/auth/login
```

**Authentication:** Not required

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `email` | string | Yes | `@NotBlank`, `@Email` | Registered email |
| `password` | string | Yes | `@NotBlank` | Account password |

**Request Example:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 3600000
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/auth/login",
  "requestId": "req-uuid-here"
}
```

---

#### 1.3 Refresh Token

Get new tokens using a refresh token.

```
POST /api/v1/auth/refresh
```

**Authentication:** Not required

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `refresh_token` | string | Yes | `@NotBlank` | The refresh token received during login |

**Request Example:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response:** `200 OK` (Same structure as Login response)

---

#### 1.4 Get Current User

Get the authenticated user's profile.

```
GET /api/v1/auth/me
```

**Authentication:** Required

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "ACTIVE"
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/auth/me",
  "requestId": "req-uuid-here"
}
```

---

### 2. Workflows

#### 2.1 Create Workflow

Create a new empty workflow with a draft version.

```
POST /api/v1/workflows
```

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `name` | string | Yes | `@NotBlank`, `@Size(max=255)` | Workflow name |
| `description` | string | No | `@Size(max=1000)` | Workflow description |

**Request Example:**

```json
{
  "name": "Onboard New User",
  "description": "Automated onboarding flow for new signups"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow created successfully",
  "data": {
    "id": "wf-uuid-here",
    "name": "Onboard New User",
    "description": "Automated onboarding flow for new signups",
    "status": "DRAFT",
    "version_number": 1,
    "created_at": "2026-07-12T11:33:21.548+05:30",
    "updated_at": "2026-07-12T11:33:21.548+05:30"
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows",
  "requestId": "req-uuid-here"
}
```

---

#### 2.2 List All Workflows

Get all workflows for the authenticated user.

```
GET /api/v1/workflows
```

**Authentication:** Required

**Request Body:** None
**Path Variables:** None
**Query Parameters:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflows retrieved successfully",
  "data": [
    {
      "id": "wf-uuid-1",
      "name": "Onboard New User",
      "description": "Automated onboarding flow",
      "status": "DRAFT",
      "version_number": 1,
      "created_at": "2026-07-12T10:00:00.000+05:30",
      "updated_at": "2026-07-12T11:00:00.000+05:30"
    },
    {
      "id": "wf-uuid-2",
      "name": "Send Welcome Email",
      "description": null,
      "status": "PUBLISHED",
      "version_number": 3,
      "created_at": "2026-07-10T09:00:00.000+05:30",
      "updated_at": "2026-07-12T08:00:00.000+05:30"
    }
  ],
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows",
  "requestId": "req-uuid-here"
}
```

---

#### 2.3 Get Workflow Detail

Get a single workflow with its full graph (nodes and edges).

```
GET /api/v1/workflows/{id}
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Workflow ID |

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow retrieved successfully",
  "data": {
    "id": "wf-uuid-here",
    "name": "Onboard New User",
    "description": "Automated onboarding flow",
    "status": "DRAFT",
    "version_number": 1,
    "created_at": "2026-07-12T11:33:21.548+05:30",
    "updated_at": "2026-07-12T11:33:21.548+05:30",
    "nodes": [
      {
        "id": "node-uuid-1",
        "name": "Trigger",
        "type": "TRIGGER",
        "sub_type": "WEBHOOK",
        "position_x": 100,
        "position_y": 200,
        "config": {
          "path": "/webhook/onboard",
          "method": "POST"
        }
      },
      {
        "id": "node-uuid-2",
        "name": "Send Welcome Email",
        "type": "ACTION",
        "sub_type": "EMAIL",
        "position_x": 400,
        "position_y": 200,
        "config": {
          "to": "{{trigger.email}}",
          "subject": "Welcome!",
          "body": "Hi {{trigger.first_name}}, welcome to our platform!"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-uuid-1",
        "source_node_id": "node-uuid-1",
        "target_node_id": "node-uuid-2",
        "label": "success"
      }
    ]
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows/wf-uuid-here",
  "requestId": "req-uuid-here"
}
```

---

#### 2.4 Save Draft

Save or update the workflow graph (nodes and edges). This overwrites the existing draft.

```
PUT /api/v1/workflows/{id}/draft
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Workflow ID |

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `nodes` | array | Yes | `@NotEmpty` | List of node objects |
| `edges` | array | No | -- | List of edge objects |

**Node Object:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `id` | string | No | -- | Node ID (omit for new nodes, include for existing) |
| `name` | string | Yes | `@NotBlank` | Display name |
| `type` | string | Yes | `@NotBlank` | Node type: `TRIGGER`, `ACTION`, `CONDITION`, `DELAY` |
| `sub_type` | string | No | -- | Sub-type (e.g. `WEBHOOK`, `EMAIL`, `HTTP_REQUEST`) |
| `position_x` | integer | Yes | `@NotNull` | X coordinate on the canvas |
| `position_y` | integer | Yes | `@NotNull` | Y coordinate on the canvas |
| `config` | object | No | -- | Node-specific configuration (varies by type) |

**Edge Object:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `id` | string | No | -- | Edge ID (omit for new edges) |
| `source_node_id` | string | Yes | `@NotBlank` | ID of the source node |
| `target_node_id` | string | Yes | `@NotBlank` | ID of the target node |
| `label` | string | No | -- | Edge label (e.g. "success", "failure", "true", "false") |

**Request Example:**

```json
{
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "TRIGGER",
      "sub_type": "WEBHOOK",
      "position_x": 100,
      "position_y": 200,
      "config": {
        "path": "/webhook/onboard",
        "method": "POST"
      }
    },
    {
      "name": "Check Plan",
      "type": "CONDITION",
      "sub_type": "IF_ELSE",
      "position_x": 400,
      "position_y": 200,
      "config": {
        "variable": "{{trigger.plan}}",
        "operator": "equals",
        "value": "premium"
      }
    },
    {
      "name": "Send Premium Welcome",
      "type": "ACTION",
      "sub_type": "EMAIL",
      "position_x": 700,
      "position_y": 100,
      "config": {
        "to": "{{trigger.email}}",
        "subject": "Welcome to Premium!"
      }
    },
    {
      "name": "Send Free Welcome",
      "type": "ACTION",
      "sub_type": "EMAIL",
      "position_x": 700,
      "position_y": 300,
      "config": {
        "to": "{{trigger.email}}",
        "subject": "Welcome!"
      }
    }
  ],
  "edges": [
    {
      "source_node_id": "node-uuid-1",
      "target_node_id": "node-uuid-2",
      "label": "success"
    },
    {
      "source_node_id": "node-uuid-2",
      "target_node_id": "node-uuid-3",
      "label": "true"
    },
    {
      "source_node_id": "node-uuid-2",
      "target_node_id": "node-uuid-4",
      "label": "false"
    }
  ]
}
```

**Response:** `200 OK` (Same structure as Get Workflow Detail -- includes returned nodes with server-assigned IDs)

---

#### 2.5 Publish Workflow

Publish the current draft. This creates a new published version that can be executed.

```
POST /api/v1/workflows/{id}/publish
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Workflow ID |

**Request Body:** None

**Response:** `200 OK` (Same structure as Get Workflow Detail, with `status: "PUBLISHED"`)

---

### 3. Runs

#### 3.1 Execute Workflow

Trigger a workflow execution.

```
POST /api/v1/workflows/{id}/run
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Workflow ID (must be published) |

**Request Body (Optional):**

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger_data` | object | No | Key-value pairs passed to the trigger node |
| `variables` | object | No | Runtime variables available to all nodes |

**Request Example:**

```json
{
  "trigger_data": {
    "email": "john@example.com",
    "first_name": "John",
    "plan": "premium"
  },
  "variables": {
    "env": "production",
    "initiated_by": "api"
  }
}
```

**Request Body Can Be Omitted Entirely:**

```
POST /api/v1/workflows/{id}/run
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow run started successfully",
  "data": {
    "id": "run-uuid-here",
    "workflow_id": "wf-uuid-here",
    "workflow_version_id": "wv-uuid-here",
    "status": "RUNNING",
    "trigger_type": "MANUAL",
    "started_at": "2026-07-12T11:33:21.548+05:30",
    "finished_at": null,
    "input_payload": {
      "trigger_data": {
        "email": "john@example.com",
        "first_name": "John"
      },
      "variables": {}
    },
    "output_payload": null,
    "error_message": null
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows/wf-uuid-here/run",
  "requestId": "req-uuid-here"
}
```

---

#### 3.2 List Workflow Runs

Get paginated execution history for a workflow.

```
GET /api/v1/workflows/{id}/runs
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Workflow ID |

**Query Parameters:**

| Name | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `page` | integer | `0` | `>= 0` | Page number (0-based) |
| `size` | integer | `20` | `1 - 100` | Items per page |

**Request Example:**

```
GET /api/v1/workflows/wf-uuid-here/runs?page=0&size=10
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow runs retrieved successfully",
  "data": {
    "items": [
      {
        "id": "run-uuid-1",
        "workflow_id": "wf-uuid-here",
        "workflow_version_id": "wv-uuid-here",
        "status": "COMPLETED",
        "trigger_type": "MANUAL",
        "started_at": "2026-07-12T11:30:00.000+05:30",
        "finished_at": "2026-07-12T11:30:05.123+05:30",
        "error_message": null
      },
      {
        "id": "run-uuid-2",
        "workflow_id": "wf-uuid-here",
        "workflow_version_id": "wv-uuid-here",
        "status": "FAILED",
        "trigger_type": "MANUAL",
        "started_at": "2026-07-12T10:00:00.000+05:30",
        "finished_at": "2026-07-12T10:00:02.456+05:30",
        "error_message": "Node 'Send Email' failed: SMTP connection timeout"
      }
    ],
    "page": 0,
    "size": 10,
    "total_elements": 25,
    "total_pages": 3
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/workflows/wf-uuid-here/runs",
  "requestId": "req-uuid-here"
}
```

---

#### 3.3 Get Run Detail

Get full details of a specific workflow run.

```
GET /api/v1/runs/{runId}
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `runId` | string | Workflow Run ID |

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Workflow run retrieved successfully",
  "data": {
    "id": "run-uuid-here",
    "workflow_id": "wf-uuid-here",
    "workflow_version_id": "wv-uuid-here",
    "status": "COMPLETED",
    "trigger_type": "MANUAL",
    "started_at": "2026-07-12T11:33:21.548+05:30",
    "finished_at": "2026-07-12T11:33:26.789+05:30",
    "input_payload": {
      "trigger_data": { "email": "john@example.com" },
      "variables": {}
    },
    "output_payload": {
      "final_result": "success"
    },
    "error_message": null
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/runs/run-uuid-here",
  "requestId": "req-uuid-here"
}
```

---

#### 3.4 Get Run Logs

Get per-node execution logs for a specific run.

```
GET /api/v1/runs/{runId}/logs
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `runId` | string | Workflow Run ID |

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Run logs retrieved successfully",
  "data": [
    {
      "id": "log-uuid-1",
      "node_id": "node-uuid-1",
      "node_name": "Webhook Trigger",
      "node_type": "TRIGGER",
      "status": "COMPLETED",
      "started_at": "2026-07-12T11:33:21.548+05:30",
      "finished_at": "2026-07-12T11:33:21.600+05:30",
      "input_payload": {
        "email": "john@example.com"
      },
      "output_payload": {
        "email": "john@example.com",
        "first_name": "John"
      },
      "error_message": null
    },
    {
      "id": "log-uuid-2",
      "node_id": "node-uuid-2",
      "node_name": "Send Welcome Email",
      "node_type": "ACTION",
      "status": "COMPLETED",
      "started_at": "2026-07-12T11:33:21.600+05:30",
      "finished_at": "2026-07-12T11:33:25.123+05:30",
      "input_payload": {
        "to": "john@example.com",
        "subject": "Welcome!"
      },
      "output_payload": {
        "message_id": "msg-123",
        "status": "sent"
      },
      "error_message": null
    }
  ],
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/runs/run-uuid-here/logs",
  "requestId": "req-uuid-here"
}
```

---

### 4. Connectors

#### 4.1 List All Connectors

Get all available connector integrations.

```
GET /api/v1/connectors
```

**Authentication:** Required

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connectors retrieved successfully",
  "data": [
    {
      "provider": "github",
      "display_name": "GitHub",
      "description": "Interact with GitHub repositories, pull requests, and issues",
      "actions": [
        {
          "action": "create_pull_request",
          "display_name": "Create Pull Request",
          "description": "Create a new pull request in a repository",
          "input_schema": {
            "repo": {
              "type": "string",
              "required": true,
              "description": "Repository name (owner/repo)"
            },
            "title": {
              "type": "string",
              "required": true,
              "description": "Pull request title"
            },
            "body": {
              "type": "string",
              "required": false,
              "description": "Pull request description"
            }
          }
        },
        {
          "action": "create_issue",
          "display_name": "Create Issue",
          "description": "Create a new issue in a repository",
          "input_schema": {
            "repo": {
              "type": "string",
              "required": true,
              "description": "Repository name (owner/repo)"
            },
            "title": {
              "type": "string",
              "required": true,
              "description": "Issue title"
            },
            "body": {
              "type": "string",
              "required": false,
              "description": "Issue body"
            }
          }
        }
      ],
      "credential_schema": {
        "token": "GitHub Personal Access Token"
      }
    }
  ],
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/connectors",
  "requestId": "req-uuid-here"
}
```

---

#### 4.2 Get Connector Detail

Get a specific connector's definition and available actions.

```
GET /api/v1/connectors/{provider}
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `provider` | string | Connector provider name (e.g. `github`, `slack`) |

**Request Body:** None

**Response:** `200 OK` (Same structure as a single item from 4.1)

---

#### 4.3 Execute Connector Action

Execute an action on a connector.

```
POST /api/v1/connectors/{provider}/actions/{action}/execute
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `provider` | string | Connector provider name |
| `action` | string | Action to execute (e.g. `create_pull_request`) |

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `credential_id` | string | Yes | `@NotBlank` | ID of the stored credential to use |
| `inputs` | object | Yes | `@NotNull` | Action-specific input parameters |

**Request Example:**

```json
{
  "credential_id": "cred-uuid-here",
  "inputs": {
    "repo": "thezaidsheikh/Flow",
    "title": "Fix: Resolve build failure",
    "body": "This PR fixes the Gradle build issue and adds missing ObjectMapper bean."
  }
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connector action executed successfully",
  "data": {
    "pull_request_url": "https://github.com/thezaidsheikh/Flow/pull/10",
    "pull_request_number": 10,
    "status": "open"
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/connectors/github/actions/create_pull_request/execute",
  "requestId": "req-uuid-here"
}
```

> **Note:** The `data` field structure varies by connector and action.

---

### 5. Credentials

Credentials store encrypted secrets for external service integrations. Secret values are **never** returned in API responses -- only the key names are returned.

#### 5.1 Create Credential

Store a new credential with encrypted secrets.

```
POST /api/v1/credentials
```

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `name` | string | Yes | `@NotBlank` | Human-readable name (e.g. "My GitHub Token") |
| `provider` | string | Yes | `@NotBlank` | Service provider (e.g. `github`, `slack`) |
| `secrets` | object | Yes | `@NotEmpty` | Key-value map of sensitive fields (encrypted at rest) |

**Request Example:**

```json
{
  "name": "GitHub Personal Token",
  "provider": "github",
  "secrets": {
    "token": "ghp_xxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Credential created successfully",
  "data": {
    "id": "cred-uuid-here",
    "name": "GitHub Personal Token",
    "provider": "github",
    "secret_keys": ["token"],
    "created_at": "2026-07-12T11:33:21.548+05:30",
    "updated_at": "2026-07-12T11:33:21.548+05:30"
  },
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/credentials",
  "requestId": "req-uuid-here"
}
```

> **Important:** The response contains `secret_keys` (array of key names), NOT the actual secret values. Secrets are AES-256-GCM encrypted at rest.

---

#### 5.2 List All Credentials

Get all credentials for the authenticated user.

```
GET /api/v1/credentials
```

**Authentication:** Required

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Credentials retrieved successfully",
  "data": [
    {
      "id": "cred-uuid-1",
      "name": "GitHub Personal Token",
      "provider": "github",
      "secret_keys": ["token"],
      "created_at": "2026-07-12T11:33:21.548+05:30",
      "updated_at": "2026-07-12T11:33:21.548+05:30"
    },
    {
      "id": "cred-uuid-2",
      "name": "Slack Bot Token",
      "provider": "slack",
      "secret_keys": ["bot_token", "signing_secret"],
      "created_at": "2026-07-11T09:00:00.000+05:30",
      "updated_at": "2026-07-11T09:00:00.000+05:30"
    }
  ],
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/credentials",
  "requestId": "req-uuid-here"
}
```

---

#### 5.3 Delete Credential

Permanently delete a credential.

```
DELETE /api/v1/credentials/{id}
```

**Authentication:** Required

**Path Variables:**

| Name | Type | Description |
|---|---|---|
| `id` | string | Credential ID |

**Request Body:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Credential deleted successfully",
  "data": null,
  "meta": null,
  "timestamp": "2026-07-12T11:33:21.548+05:30",
  "path": "/api/v1/credentials/cred-uuid-here",
  "requestId": "req-uuid-here"
}
```

---

### 6. Actuator

#### 6.1 Health Check

Check if the server is running and connected to its dependencies.

```
GET /api/v1/actuator/health
```

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "status": "UP",
  "groups": ["liveness", "readiness"]
}
```

---

#### 6.2 Info

Get application info.

```
GET /api/v1/actuator/info
```

**Authentication:** Not required

**Response:** `200 OK`

```json
{}
```

> **Note:** Only `health` and `info` actuator endpoints are exposed. All other actuator endpoints are disabled.

---

## Enums Reference

### Workflow Version Status

| Value | Description |
|---|---|
| `DRAFT` | Initial state after creation. Can be edited. |
| `PUBLISHED` | Published and executable. |
| `ARCHIVED` | No longer active. |

### Node Type

| Value | Description |
|---|---|
| `TRIGGER` | Entry point of the workflow (webhook, schedule, etc.) |
| `ACTION` | Performs an operation (send email, HTTP call, etc.) |
| `CONDITION` | Branching logic (if/else, switch) |
| `DELAY` | Waits for a specified duration |

### Run Status

| Value | Description |
|---|---|
| `RUNNING` | Execution is in progress |
| `COMPLETED` | Execution finished successfully |
| `FAILED` | Execution failed (see `error_message` for details) |

### User Status

| Value | Description |
|---|---|
| `ACTIVE` | User account is active |

---

## Complete Endpoint Summary

| # | Method | Endpoint | Auth | Request Body | Response |
|---|--------|----------|------|--------------|----------|
| 1 | `POST` | `/api/v1/auth/register` | No | `RegisterUserReqDto` | `UserResDto` |
| 2 | `POST` | `/api/v1/auth/login` | No | `LoginReqDto` | `AuthResDto` |
| 3 | `POST` | `/api/v1/auth/refresh` | No | `RefreshTokenReqDto` | `AuthResDto` |
| 4 | `GET` | `/api/v1/auth/me` | Yes | -- | `UserResDto` |
| 5 | `POST` | `/api/v1/workflows` | Yes | `CreateWorkflowRequest` | `WorkflowResponse` |
| 6 | `GET` | `/api/v1/workflows` | Yes | -- | `List<WorkflowResponse>` |
| 7 | `GET` | `/api/v1/workflows/{id}` | Yes | -- | `WorkflowDetailResponse` |
| 8 | `PUT` | `/api/v1/workflows/{id}/draft` | Yes | `SaveDraftRequest` | `WorkflowDetailResponse` |
| 9 | `POST` | `/api/v1/workflows/{id}/publish` | Yes | -- | `WorkflowDetailResponse` |
| 10 | `POST` | `/api/v1/workflows/{id}/run` | Yes | `RunWorkflowRequest` (opt.) | `WorkflowRunDetailResponse` |
| 11 | `GET` | `/api/v1/workflows/{id}/runs` | Yes | -- | `WorkflowRunPageResponse` |
| 12 | `GET` | `/api/v1/runs/{runId}` | Yes | -- | `WorkflowRunDetailResponse` |
| 13 | `GET` | `/api/v1/runs/{runId}/logs` | Yes | -- | `List<NodeRunLogResponse>` |
| 14 | `GET` | `/api/v1/connectors` | Yes | -- | `List<ConnectorDefinition>` |
| 15 | `GET` | `/api/v1/connectors/{provider}` | Yes | -- | `ConnectorDefinition` |
| 16 | `POST` | `/api/v1/connectors/{provider}/actions/{action}/execute` | Yes | `ExecuteConnectorActionRequest` | `Map<String, Object>` |
| 17 | `POST` | `/api/v1/credentials` | Yes | `CreateCredentialRequest` | `CredentialResponse` |
| 18 | `GET` | `/api/v1/credentials` | Yes | -- | `List<CredentialResponse>` |
| 19 | `DELETE` | `/api/v1/credentials/{id}` | Yes | -- | `Void` |
| 20 | `GET` | `/api/v1/actuator/health` | No | -- | Health status |
| 21 | `GET` | `/api/v1/actuator/info` | No | -- | App info |

---

## Frontend Integration Notes

### Token Management

```javascript
// Store tokens after login
const { access_token, refresh_token } = loginResponse.data;

// Attach to every protected request
fetch('/api/v1/workflows', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});

// Auto-refresh on 401
if (response.status === 401) {
  const refreshed = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token })
  });
  // Store new tokens and retry original request
}
```

### Workflow Builder (Visual Editor)

The workflow canvas uses a node-based graph model:

- **Nodes** have `position_x` / `position_y` for canvas coordinates
- **Edges** connect nodes via `source_node_id` -> `target_node_id`
- **Edge labels** control branching (`"true"`, `"false"`, `"success"`, `"failure"`)
- **Node config** is a flexible JSON object (schema varies by node type/sub_type)

### Credential Security

- Credentials are encrypted at rest with AES-256-GCM
- The API **never** returns secret values -- only key names (`secret_keys`)
- Users must re-send secret values if they need to update credentials
