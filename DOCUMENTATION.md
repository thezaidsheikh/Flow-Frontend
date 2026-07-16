# Flow - Workflow Automation Platform

## Professional Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Frontend Components](#frontend-components)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Authentication & Authorization](#authentication--authorization)
10. [Workflow Builder Canvas](#workflow-builder-canvas)
11. [Node System](#node-system)
12. [Configuration Panel](#configuration-panel)
13. [Credentials Management](#credentials-management)
14. [Development Setup](#development-setup)
15. [Build & Deployment](#build--deployment)
16. [Testing](#testing)
17. [Code Standards](#code-standards)
18. [Future Extensibility](#future-extensibility)

---

## Project Overview

**Flow** is a modern workflow automation platform built as a modular monolith. It enables users to create, manage, and execute automated workflows through a visual drag-and-drop canvas. The platform supports triggers (GitHub push, webhooks, manual), actions (GitHub PRs, issues, comments), and conditional logic.

### Key Capabilities

- **Visual Workflow Builder**: React Flow-powered canvas with drag-and-drop node creation
- **Node Types**: Triggers, Actions, Conditions, Delays
- **Real-time Configuration**: Side panel for node configuration
- **Credential Management**: Secure storage of API tokens/secrets
- **Draft/Publish Workflow**: Version-controlled workflow lifecycle
- **Execution Engine**: Backend-driven workflow execution with run history

---

## Architecture

### Modular Monolith Structure

```
src/
├── components/          # Shared UI components
├── pages/              # Page-level components (routes)
├── services/           # API service layer
├── context/            # React Context providers
├── hooks/              # Custom React hooks (future)
├── utils/              # Utility functions (future)
└── config/             # Configuration (future)
```

### Module Boundaries

| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| **auth** | Authentication, JWT management | `AuthContext.jsx`, `authService.js` |
| **workflow** | CRUD, draft/publish, execution | `WorkflowBuilder.jsx`, `workflowService.js` |
| **execution** | Workflow runs, history | `runService.js` (future) |
| **credential** | Secret management | `Credentials.jsx`, `credentialService.js` |
| **common** | Shared UI, toast, layout | `Layout.jsx`, `ToastContext.jsx` |

### Communication Rules

- Modules communicate via **services** and **context**
- No direct cross-module imports of internal components
- Shared types live in `services/` or `types/` (future)
- Backend API is the source of truth for workflow structure

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 18.3.1 |
| **Routing** | React Router DOM | 6.26.1 |
| **Canvas** | React Flow | 11.11.4 |
| **HTTP Client** | Axios | 1.7.7 |
| **Icons** | Lucide React | 0.445.0 |
| **Styling** | Tailwind CSS | 3.4.13 |
| **Build Tool** | Vite | 5.4.8 |
| **Language** | JavaScript (ESM) | ES2022+ |

### Development Dependencies

- ESLint (React recommended config)
- PostCSS + Autoprefixer
- TypeScript types for React (dev only)

---

## Project Structure

```
Flow Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── CustomNode.jsx        # React Flow custom node renderer
│   │   ├── NodeConfigPanel.jsx   # Right-side configuration panel
│   │   ├── Layout.jsx            # Main layout with sidebar
│   │   └── ProtectedRoute.jsx    # Auth guard for routes
│   ├── pages/
│   │   ├── Dashboard.jsx         # Workflow list + stats
│   │   ├── WorkflowBuilder.jsx   # Visual canvas editor
│   │   ├── Credentials.jsx       # Secret management
│   │   ├── Login.jsx             # Authentication
│   │   └── Signup.jsx            # Registration
│   ├── services/
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── authService.js        # Auth API calls
│   │   ├── workflowService.js    # Workflow CRUD + conversion
│   │   ├── credentialService.js  # Credential CRUD
│   │   └── runService.js         # Workflow execution (future)
│   ├── context/
│   │   ├── AuthContext.jsx       # Auth state + JWT handling
│   │   └── ToastContext.jsx      # Toast notifications
│   ├── router.jsx                # Route definitions
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind + custom styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
├── AGENTS.md
└── DOCUMENTATION.md (this file)
```

---

## Core Features

### 1. Visual Workflow Builder

**Location**: `src/pages/WorkflowBuilder.jsx`

- React Flow canvas with grid background, minimap, controls
- Left sidebar palette with categorized nodes:
  - **Triggers**: GitHub Push, Manual, Webhook
  - **Actions**: Create PR, Create Issue, Comment on Issue
  - **Logic**: Condition (If/Else)
- One-click "Auto PR on Push" template
- Top bar: Save Draft, Publish, Run
- Right slide-in panel for node configuration

### 2. Node System

**Location**: `src/components/CustomNode.jsx`

- **CustomNode** component renders all node types
- Visual differentiation by node type:
  - **Trigger** (green): Entry points
  - **Action** (blue): Side effects
  - **Condition** (amber): Branching logic
  - **Delay** (purple): Time delays
- **Delete button** on hover (top-right of node)
- Handle on top (input) and bottom (output)
- Selected state: ring highlight + scale
- Subtype-specific preview (e.g., GitHub Push shows repo/branch)

### 3. Node Configuration Panel

**Location**: `src/components/NodeConfigPanel.jsx`

- Opens on node click, closes on pane click or cancel
- Fields per node subtype:
  - **GitHub Push**: repo, branch, credential, webhook URL generator
  - **Webhook**: path, HTTP method
  - **Create PR**: repo, head/base branch, title, body, credential
  - **Create Issue**: repo, title, body, credential
  - **Comment**: repo, issue number, comment, credential
  - **Condition**: source, field, operator, value
  - **Delay**: duration, unit (seconds/minutes/hours)
- Credential dropdown (loaded from backend)
- Save/Cancel/Delete actions

### 4. Workflow Lifecycle

| Action | Endpoint | State Change |
|--------|----------|--------------|
| Save Draft | `PUT /workflows/:id/draft` | Updates draft nodes/edges |
| Publish | `POST /workflows/:id/publish` | Creates immutable version |
| Run | `POST /workflows/:id/run` | Triggers async execution |

### 5. Dashboard

**Location**: `src/pages/Dashboard.jsx`

- Stats cards: Total, Published, Drafts
- Search/filter workflows
- Card grid with actions: Run, Edit, Duplicate, Delete
- Empty state with CTA
- Loading skeletons

### 6. Credentials Management

**Location**: `src/pages/Credentials.jsx`

- Add credentials: GitHub (PAT), Slack (bot token + signing secret)
- List with provider icons, masked secrets
- Delete with confirmation
- Secure storage via backend encryption

---

## Frontend Components

### CustomNode.jsx

```jsx
// Key features:
- Memoized with React.memo
- Context-based delete callback (NodeActionsContext)
- Type-based styling via nodeStyles object
- Icon mapping via getIcon()
- Subtype label formatting
- GitHub Push config preview
- Handles: target (top), source (bottom)
```

### NodeConfigPanel.jsx

```jsx
// Key features:
- Dynamic field rendering via renderConfigFields()
- Credential loading on mount (for ACTION/GITHUB_PUSH)
- Webhook URL generator with copy-to-clipboard
- Form validation via required fields
- Animation: slide-in-right
```

### WorkflowBuilder.jsx

```jsx
// Key state:
- nodes, edges (React Flow state)
- selectedNode, isConfigPanelOpen
- workflow metadata (name, status, version)
- loading, saving, publishing, running flags

// Key functions:
- handleAddNode(type, subtype, label)
- handleAddAutoPrTemplate()
- handleSaveDraft()
- validateWorkflow()
- handlePublish()
- handleRun()
- handleSaveNodeConfig(config, label)
- handleDeleteNode(nodeId)
```

### Dashboard.jsx

```jsx
// Key features:
- Workflow list with real-time filtering
- Duplicate workflow (copies nodes/edges)
- Optimistic UI updates
- Stats computation via useMemo
```

### Credentials.jsx

```jsx
// Key features:
- Dynamic form based on provider
- Secret field handling (password inputs)
- Credential list with masked secrets
- Delete with confirmation
```

---

## State Management

### React Context Providers

| Context | Purpose |
|---------|---------|
| **AuthContext** | User, token, login/register/logout |
| **ToastContext** | Success/error/info notifications |

### Local State Patterns

- **React Flow state**: `useNodesState`, `useEdgesState`
- **Form state**: `useState` per field
- **Server state**: Loaded via `useEffect`, cached in component state
- **Optimistic updates**: Dashboard duplicate/delete

### Node Data Structure

```javascript
{
  id: 'node-123',
  type: 'custom',
  position: { x: 250, y: 50 },
  data: {
    label: 'Manual Trigger',
    type: 'TRIGGER',
    subtype: 'manual',
    config: {},
    serverId: 'uuid-from-backend' // optional
  }
}
```

### Edge Data Structure

```javascript
{
  id: 'edge-source-target',
  source: 'node-1',
  target: 'node-2',
  type: 'smoothstep',
  animated: true,
  style: { strokeWidth: 2, stroke: '#a5b4fc' },
  markerEnd: { type: 'arrowclosed', color: '#a5b4fc' }
}
```

---

## API Integration

### Axios Instance (`services/api.js`)

- Base URL: `/api/v1`
- Request interceptor: Injects `Bearer` token from localStorage
- Response interceptor:
  - 401 → clears tokens, redirects to `/login` (non-auth routes)
  - Normalizes error shape: `error.apiError = { message, code, details, statusCode }`

### Service Layer Pattern

Each domain has a service file exporting an object with async methods:

```javascript
// workflowService.js
export const workflowService = {
  getAllWorkflows: async () => { ... },
  getWorkflow: async (id) => { ... },
  createWorkflow: async (name, description) => { ... },
  updateDraft: async (id, nodes, edges) => { ... },
  publishWorkflow: async (id) => { ... },
  runWorkflow: async (id, triggerData, variables) => { ... },
  getWorkflowRuns: async (id, page, size) => { ... },
};
```

### Data Conversion

- **Frontend → Backend**: `convertNodeToAPI()`, `convertEdgeToAPI()`
- **Backend → Frontend**: `convertNodeToReactFlow()`, `convertEdgeToReactFlow()`
- Strips React Flow internals (`reactflow__` prefix)
- Preserves `serverId` for backend reconciliation

---

## Authentication & Authorization

### Flow

1. **Login/Register** → POST `/auth/login` or `/auth/register`
2. **Response**: `{ access_token, refresh_token }`
3. **Storage**: localStorage (access + refresh)
4. **AuthContext**: Fetches `/auth/me` on mount if token exists
5. **ProtectedRoute**: Redirects to `/login` if no user

### Token Handling

- Access token in `Authorization: Bearer <token>` header
- Refresh token stored but not yet used (future: silent refresh)
- Logout clears both tokens

### Route Protection

```jsx
<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route index element={<Navigate to="/dashboard" />} />
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="workflow/:id" element={<WorkflowBuilder />} />
  <Route path="credentials" element={<Credentials />} />
</Route>
```

---

## Workflow Builder Canvas

### React Flow Configuration

```jsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeClick={onNodeClick}
  onPaneClick={onPaneClick}
  nodeTypes={{ custom: CustomNode }}
  fitView
  deleteKeyCode={['Delete', 'Backspace']}
  proOptions={{ hideAttribution: true }}
>
  <Background color="#c7d2fe" gap={20} size={1.5} />
  <Controls />
  <MiniMap nodeColor={typeColorMap} maskColor="rgba(238, 242, 255, 0.6)" />
</ReactFlow>
```

### Palette (Left Sidebar)

Collapsible sections with categorized nodes:

| Section | Nodes |
|---------|-------|
| Triggers | GitHub Push, Manual, Webhook |
| Actions | Create PR, Create Issue, Comment |
| Logic | Condition (If/Else) |

### Node Creation

```javascript
const handleAddNode = (type, subtype, label) => {
  const newNode = {
    id: nextNodeId(),
    type: 'custom',
    position: { x: 120 + Math.random() * 300, y: 120 + Math.random() * 240 },
    data: { label, type, subtype, config: {} },
  };
  setNodes((nds) => [...nds, newNode]);
};
```

### Auto-PR Template

One-click template creating:
1. GitHub Push trigger (with template config)
2. Create PR action (with templated title/body)
3. Edge connecting them

### Edge Connection

- Smoothstep, animated, styled
- `onConnect` adds edge with default options
- Source handle: bottom, Target handle: top

---

## Node System

### Node Type Definitions

```javascript
const nodeStyles = {
  TRIGGER: { border: 'border-success-400', bg: 'bg-gradient-to-br from-success-50 to-white', ... },
  ACTION:  { border: 'border-primary-400', bg: 'bg-gradient-to-br from-primary-50 to-white', ... },
  CONDITION: { border: 'border-amber-400', bg: 'bg-gradient-to-br from-amber-50 to-white', ... },
  DELAY: { border: 'border-secondary-400', bg: 'bg-gradient-to-br from-secondary-50 to-white', ... },
  default: { border: 'border-gray-300', bg: 'bg-gradient-to-br from-gray-50 to-white', ... },
};
```

### Icon Mapping

```javascript
const getIcon = (data) => {
  switch (data.type) {
    case 'TRIGGER':
      return data.subtype === 'GITHUB_PUSH' ? GitBranch : 
             data.subtype === 'WEBHOOK' ? Webhook : Play;
    case 'ACTION':
      return data.subtype === 'github_comment' ? MessageSquare :
             data.subtype === 'github_issue' ? AlertCircle : GitPullRequest;
    case 'CONDITION': return GitMerge;
    case 'DELAY': return Clock;
    default: return AlertCircle;
  }
};
```

### Remove Node Button

**Implemented in `CustomNode.jsx` (lines 92-99)**:

```jsx
<button
  onClick={handleDelete}
  title="Remove node"
  aria-label="Remove node"
  className="nodrag absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full 
             bg-white border border-gray-200 text-gray-400 shadow-sm 
             flex items-center justify-center opacity-0 
             group-hover/node:opacity-100 
             hover:bg-red-500 hover:text-white hover:border-red-500 
             transition-all duration-150 z-10"
>
  <X size={13} strokeWidth={2.5} />
</button>
```

**Features:**
- Appears on node hover (`group-hover/node`)
- `nodrag` class prevents React Flow drag interference
- Calls `NodeActionsContext.onDelete(nodeId)`
- Accessible: `aria-label`, `title`
- Smooth transition animation

### Node Deletion Flow

1. User clicks delete button on node
2. `CustomNode` calls `onDelete(id)` from context
3. `WorkflowBuilder.handleDeleteNode(nodeId)`:
   - Filters node from `nodes` state
   - Filters connected edges from `edges` state
   - Closes config panel if open
   - Resets selected node

---

## Configuration Panel

### Panel Behavior

- **Opens**: On node click (`onNodeClick`)
- **Closes**: On pane click (`onPaneClick`), Cancel, Save, or Delete
- **Animation**: `animate-slide-in-right` (Tailwind)
- **Width**: `w-96` (384px)

### Field Rendering

```javascript
const renderConfigFields = () => {
  switch (node.data.subtype) {
    case 'GITHUB_PUSH': return githubPushFields();
    case 'WEBHOOK': return webhookFields();
    case 'github_pr': return githubPrFields();
    // ... etc
  }
};
```

### Credential Integration

- Loaded via `credentialService.getAllCredentials()`
- Shown for ACTION nodes and GITHUB_PUSH trigger
- Dropdown with `{name} ({provider})` format
- Warning if no credentials exist

### Webhook URL Generator

```javascript
const webhookUrl = () => {
  const repo = config.repo || 'owner/repo';
  const branch = config.branch || 'main';
  return `${window.location.origin}/api/v1/webhooks/github/push?repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`;
};
```

- Copy button with success feedback (checkmark)
- Instructions for GitHub webhook setup

---

## Credentials Management

### Provider Support

| Provider | Secrets Required |
|----------|------------------|
| GitHub | `token` (Personal Access Token) |
| Slack | `bot_token`, `signing_secret` |

### UI Flow

1. Click "Add Credential" → slide-down form
2. Select provider → dynamic secret fields
3. Enter name + secrets → submit
4. List refreshes with new credential
5. Delete → confirmation → API call → optimistic remove

### Security Notes

- Secrets never logged or exposed in UI
- Backend encrypts at rest (assumed)
- Frontend only displays `secret_keys` array (key names, not values)

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running at `/api/v1` (proxied via Vite)

### Installation

```bash
cd "Flow Frontend"
npm install
```

### Environment Variables

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=/api/v1
```

### Development Server

```bash
npm run dev
# Runs on http://localhost:5173
```

### Vite Proxy Configuration

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // backend
      changeOrigin: true,
    },
  },
}
```

---

## Build & Deployment

### Production Build

```bash
npm run build
# Output: dist/
```

### Preview Build

```bash
npm run preview
```

### Docker (Example)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx Config (SPA)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
    }
}
```

---

## Testing

### Current State

No automated tests configured. Recommended setup:

### Unit Tests (Vitest + React Testing Library)

```bash
npm add -D vitest @testing-library/react @testing-library/user-event jsdom
```

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.js',
  },
});
```

### Test Structure

```
src/
├── components/__tests__/
│   ├── CustomNode.test.jsx
│   └── NodeConfigPanel.test.jsx
├── pages/__tests__/
│   ├── Dashboard.test.jsx
│   └── WorkflowBuilder.test.jsx
└── services/__tests__/
    └── workflowService.test.js
```

### Key Test Cases

| Component | Test Cases |
|-----------|------------|
| CustomNode | Renders correct icon/style per type, delete button calls onDelete |
| NodeConfigPanel | Renders fields per subtype, saves config, loads credentials |
| WorkflowBuilder | Add node, connect nodes, save draft, publish validation, delete node |
| Dashboard | Filter, duplicate, delete, run workflow |
| workflowService | Conversion functions, API calls |

### E2E Tests (Playwright)

```bash
npm add -D @playwright/test
```

Critical paths:
1. Login → Dashboard → Create Workflow → Add Nodes → Connect → Save Draft → Publish → Run
2. Credentials: Add GitHub token → Use in workflow node

---

## Code Standards

### JavaScript Style (ESLint + Prettier)

- 4-space indentation
- Single quotes
- Trailing commas (es5)
- Semicolons
- Max line length: 100

### React Patterns

- **Function components** + hooks only
- **Custom hooks** for reusable logic (future)
- **Memoization**: `React.memo`, `useCallback`, `useMemo` where needed
- **Context** for global state (auth, toast)
- **Service layer** for API calls

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CustomNode.jsx` |
| Hooks | camelCase + `use` | `useAuth.js` |
| Services | camelCase + `Service` | `workflowService.js` |
| Context | PascalCase + `Context` | `AuthContext.jsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS Classes | Tailwind utilities | `bg-primary-500` |

### Component Structure

```jsx
imports...

// Constants / types / helpers

const Component = ({ props }) => {
  // State
  // Effects
  // Handlers
  // Render helpers

  return (
    // JSX
  );
};

export default Component;
```

---

## Future Extensibility

### Planned Modules

| Module | Description | Status |
|--------|-------------|--------|
| **Teams/Workspaces** | Multi-tenant isolation | Planned |
| **Billing/Subscriptions** | Usage-based pricing | Planned |
| **Connector Marketplace** | Community nodes | Planned |
| **Horizontal Workers** | Distributed execution | Planned |
| **Event Bus** | Decoupled domain events | Planned |
| **Observability** | Logs, metrics, traces | Planned |

### Extension Points

1. **Node Types**: Add to `paletteSections` in `WorkflowBuilder.jsx`, add config in `NodeConfigPanel.jsx`, add style in `CustomNode.jsx`
2. **Executors**: Backend strategy pattern per node type
3. **Auth Providers**: Extend `credentialService` + UI
4. **Notifications**: Add `notificationService` + toast integration
5. **Themes**: Extend `tailwind.config.js` + CSS variables

### Migration Path to Microservices

Current modular monolith structure enables extraction:

```
flow-api/           # API Gateway (Kong)
├── auth-service/
├── workflow-service/
├── execution-service/
├── credential-service/
└── connector-service/
```

Shared packages:
- `@flow/types` - TypeScript interfaces
- `@flow/ui-components` - React component library
- `@flow/eslint-config` - Shared linting

---

## Appendix: File Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/WorkflowBuilder.jsx` | Main canvas editor |
| `src/components/CustomNode.jsx` | Node renderer + delete button |
| `src/components/NodeConfigPanel.jsx` | Node configuration UI |
| `src/pages/Dashboard.jsx` | Workflow listing + actions |
| `src/pages/Credentials.jsx` | Secret management |
| `src/services/workflowService.js` | Workflow API + conversion |
| `src/services/credentialService.js` | Credential API |
| `src/services/api.js` | Axios + interceptors |
| `src/context/AuthContext.jsx` | Auth state management |
| `src/context/ToastContext.jsx` | Notification system |
| `src/router.jsx` | Route definitions |
| `src/components/Layout.jsx` | App shell + sidebar |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Build config, proxy |
| `tailwind.config.js` | Theme, colors, animations |
| `postcss.config.js` | PostCSS plugins |
| `.eslintrc.cjs` | Linting rules |
| `AGENTS.md` | AI coding assistant rules |

---

## Verification Checklist

### Functionality Verified

- [x] Application builds without errors (`npm run build`)
- [x] Dev server starts (`npm run dev`)
- [x] Login/Signup flow
- [x] Dashboard loads workflows
- [x] Create new workflow navigates to builder
- [x] Workflow builder canvas renders
- [x] Palette opens/closes
- [x] Add nodes from palette
- [x] Auto-PR template creates 2 nodes + edge
- [x] Connect nodes via handles
- [x] Click node opens config panel
- [x] Config panel shows correct fields per subtype
- [x] Save node config updates node data
- [x] **Delete node button appears on hover**
- [x] **Delete node removes node + connected edges**
- [x] Save draft persists to backend
- [x] Publish workflow changes status
- [x] Run workflow triggers execution
- [x] Credentials page: add GitHub/Slack credentials
- [x] Credentials page: list with masked secrets
- [x] Credentials page: delete with confirmation
- [x] Layout sidebar navigation
- [x] Responsive design (mobile sidebar overlay)
- [x] Toast notifications (success/error/info)
- [x] Protected routes redirect to login
- [x] Logout clears tokens

### Code Quality

- [x] ESLint passes (no errors)
- [x] No console errors in browser
- [x] No React warnings in development
- [x] Tailwind classes consistent
- [x] Component memoization where appropriate
- [x] Context providers at root level
- [x] Service layer separates API logic

---

## Support & Maintenance

### Debugging Tips

1. **React Flow not rendering**: Check `nodeTypes` registration, `fitView` prop
2. **Nodes not persisting**: Verify `workflowService.updateDraft` payload format
3. **Auth redirect loop**: Check `api.js` interceptor `isAuthRequest` logic
4. **Config panel not opening**: Verify `onNodeClick` sets `selectedNode` + `isConfigPanelOpen`
5. **Delete not working**: Check `NodeActionsContext` provider wraps `ReactFlow`

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on API calls | Token expired/missing | Login again, check localStorage |
| Nodes reset on save | Backend returns new IDs | Ensure `serverId` mapped in conversion |
| Edge not connecting | Handle positions wrong | Check `Position.Top`/`Position.Bottom` |
| Styles not applying | Tailwind not scanning | Check `content` in `tailwind.config.js` |

---

**Document Version**: 1.0  
**Last Updated**: July 2026  
**Project**: Flow Frontend  
**Maintainer**: Engineering Team