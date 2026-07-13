# Flow Frontend

Flow Frontend is a React-based web application for the Flow workflow automation platform. It provides a clean, professional interface for creating, managing, and executing automation workflows with a focus on GitHub integrations.

## Features

### Authentication

- User registration and login with JWT authentication
- Protected routes with automatic token management
- Secure credential storage and management

### Workflow Management

- **Dashboard**: View all workflows with status and last modified date
- **Workflow Builder**: Visual drag-and-drop canvas using React Flow
- **Node Types**:
  - Triggers: Manual Trigger
  - Actions: GitHub Pull Request, GitHub Issue, GitHub Comment
  - Logic: Condition nodes for branching
- **Node Configuration**: Side panel for configuring node-specific settings
- **Workflow Operations**: Create, edit, duplicate, delete, publish, and run workflows

### Credentials Management

- Add and manage GitHub Personal Access Tokens
- Secure token storage with masked display
- Credential selection in workflow nodes

### UI/UX

- Clean, minimal design inspired by n8n
- Responsive sidebar navigation
- Professional color scheme with blue accent
- Desktop-first workflow builder experience

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **React Flow** - Workflow canvas and node graph
- **Lucide React** - Icon library
- **Axios** - HTTP client for API requests

## Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── CustomNode.jsx          # Custom React Flow node component
│   ├── Layout.jsx              # Main layout with sidebar
│   ├── NodeConfigPanel.jsx     # Side panel for node configuration
│   └── ProtectedRoute.jsx      # Route protection wrapper
├── context/             # React context providers
│   └── AuthContext.jsx         # Authentication state management
├── pages/               # Page components
│   ├── Login.jsx               # Login page
│   ├── Signup.jsx              # Registration page
│   ├── Dashboard.jsx           # Workflow dashboard
│   ├── WorkflowBuilder.jsx     # Workflow editor canvas
│   └── Credentials.jsx        # Credential management
├── services/            # API service layer
│   ├── api.js                  # Axios instance with interceptors
│   ├── authService.js          # Authentication API calls
│   ├── workflowService.js      # Workflow API calls
│   └── credentialService.js    # Credential API calls
├── App.jsx               # Root component
├── router.jsx            # Route configuration
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Prerequisites

- Node.js 18+ and npm
- Flow Backend API running on `http://localhost:3002`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Configuration

The frontend is configured to proxy API requests to the backend:

```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      changeOrigin: true,
    }
  }
}
```

Ensure the Flow backend is running on `http://localhost:3002` before starting the frontend.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend integrates with the Flow backend API:

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Workflow Endpoints

- `GET /api/v1/workflows` - List all workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/{id}` - Get workflow details
- `PUT /api/v1/workflows/{id}/draft` - Save draft
- `POST /api/v1/workflows/{id}/publish` - Publish workflow
- `POST /api/v1/workflows/{id}/run` - Execute workflow
- `DELETE /api/v1/workflows/{id}` - Delete workflow

### Credential Endpoints

- `GET /api/v1/credentials` - List credentials
- `POST /api/v1/credentials` - Add credential
- `DELETE /api/v1/credentials/{id}` - Delete credential

## Usage

### 1. Authentication

- Navigate to `/signup` to create a new account
- Login with your credentials at `/login`
- Authenticated users are redirected to the dashboard

### 2. Creating Workflows

- Click "Create Workflow" on the dashboard
- Add nodes from the left panel (Triggers, Actions, Logic)
- Connect nodes by dragging from one node's handle to another
- Click on a node to configure its settings
- Save drafts or publish when ready

### 3. Managing Credentials

- Navigate to Credentials page
- Add GitHub Personal Access Tokens
- Credentials are used in workflow action nodes

### 4. Running Workflows

- Click the "Run" button on workflow cards
- Or use the "Run" button in the workflow builder
- View execution results (backend provides run logs)

## Development Notes

### State Management

- React Context is used for authentication state
- Component-level state for UI interactions
- API calls are centralized in service layer

### Styling

- Tailwind CSS for utility-first styling
- Custom component classes in `index.css`
- Consistent color palette with primary blue accent

### Error Handling

- API interceptors handle 401 responses (auto-logout)
- User-friendly error messages displayed in UI
- Loading states for async operations

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

## Future Enhancements

- Real-time workflow execution status
- Workflow run history and logs viewer
- Additional node types (Slack, email, HTTP)
- Workflow templates
- Team/workspace collaboration features
- Advanced scheduling and webhooks

## License

This project is part of the Flow workflow automation platform capstone project.
