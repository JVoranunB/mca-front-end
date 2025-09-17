# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React-based workflow automation builder POC that mimics Shopify Flow. The project uses **npm workspaces** with the main application in the `workflow-builder/` directory and dependencies managed at the root level.

### Key Architecture Components

- **React Flow Canvas**: Visual workflow editor using `@xyflow/react` for drag-and-drop node connections
- **Shopify Polaris UI**: Complete integration with Shopify's design system for consistent UI components
- **Zustand State Management**: Centralized state in `src/store/workflowStore.ts` with localStorage persistence
- **Node-based Architecture**: Four node types (trigger, condition, action, step) with custom React Flow components
- **TypeScript Types**: Comprehensive type definitions in `src/types/workflow.types.ts`

### Component Structure

```
src/
├── components/
│   ├── nodes/                  # Custom React Flow node components
│   │   ├── StartNode.tsx       # Purple nodes - workflow starting point (auto-created)
│   │   ├── TriggerNode.tsx     # Purple nodes - workflow entry points (legacy)
│   │   ├── ConditionNode.tsx   # Green nodes - decision logic with Then/Otherwise branches
│   │   ├── ActionNode.tsx      # Teal nodes - workflow actions
│   │   └── StepNode.tsx        # Indigo nodes - utility steps
│   ├── NodeSidebar.tsx         # Left sidebar with draggable node templates (collapsible)
│   ├── PropertiesSidebar.tsx   # Right sidebar for node configuration (collapsible)
│   ├── TopBar.tsx              # Navigation with save/load/clear actions
│   └── WorkflowCanvas.tsx      # Main React Flow canvas
├── pages/
│   ├── WorkflowListPage.tsx    # Workflow management dashboard
│   └── WorkflowBuilderPage.tsx # Main workflow editor page
├── store/workflowStore.ts      # Zustand store with all workflow state
├── types/workflow.types.ts     # TypeScript definitions
└── data/
    ├── nodeTemplates.ts        # Available node templates by category
    └── sampleWorkflows.ts      # Sample workflow data
```

## Development Commands

**Working Directory**: Always run commands from **root directory** (`mca-front-end/`), NOT from `workflow-builder/`.

```bash
# Installation (uses npm workspaces)
npm install          # Install all dependencies to root node_modules

# Development
npm run dev          # Start development server (uses port 5173 only)
npm run build:uat    # Build for UAT environment
npm run build:production # Build for production environment
npm run deploy:uat   # Deploy to UAT (requires AWS credentials)
npm run deploy:production # Deploy to production (requires AWS credentials)

# Port Management
# Dev server ONLY uses port 5173. If port is busy or cache needs clearing:
# 1. Stop the current server (Ctrl+C)
# 2. Kill any processes on port 5173: taskkill /F /IM node.exe
# 3. Restart: npm run dev

# Workspace-specific commands (run from root)
cd workflow-builder && npm run lint    # Run ESLint
cd workflow-builder && npm run preview # Preview production build
```

## npm Workspaces Structure

```
mca-front-end/                    # Root workspace
├── node_modules/                 # All dependencies (centralized)
├── package.json                  # Workspace configuration + deployment scripts
├── package-lock.json             # Single lockfile for entire project
├── .github/workflows/uat.yml     # GitHub Actions CI/CD
└── workflow-builder/             # Application workspace
    ├── package.json              # App-specific config + build scripts
    ├── src/                      # Application source code
    └── dist/                     # Build output (created by Vite)
```

**Important**: Do NOT create duplicate `node_modules` in `workflow-builder/`. All dependencies are hoisted to the root.

## State Management Architecture

The application uses Zustand for state management with the following key patterns:

- **Centralized Store**: `workflowStore.ts` handles all nodes, edges, workflows, and validation
- **Real-time Updates**: Changes automatically trigger React Flow re-renders
- **Persistence**: Workflows saved to localStorage with JSON serialization
- **Validation System**: Built-in workflow validation with error/warning states
- **Dirty State Tracking**: Tracks unsaved changes for user notifications

### Key Store Methods

- `addNode()`, `updateNode()`, `deleteNode()` - Node operations
- `onNodesChange()`, `onEdgesChange()` - React Flow integration
- `saveWorkflow()`, `loadWorkflow()` - Persistence operations
- `validateWorkflow()` - Workflow validation with error reporting
- `toggleLeftSidebar()`, `toggleRightSidebar()` - Sidebar visibility control
- `setLeftSidebarVisible()`, `setRightSidebarVisible()` - Direct sidebar state setters

## Node System Architecture

### Node Types and Behaviors

1. **Start Node**: Auto-created workflow entry point, no input handles, colored purple
2. **Condition Nodes**: Decision logic with "then" and "otherwise" output handles, colored green
3. **Action Nodes**: Workflow actions (SMS, Email, LINE, Webhook, Tags), single input/output, colored teal
4. **Step Nodes**: Utility functions (Wait, Log), single input/output, colored indigo

### Available Actions

- **Send SMS notification**: Editable message content with dynamic variables
- **Send email notification**: Editable subject and body (HTML supported)
- **Send LINE notification**: LINE messaging with optional images
- **Trigger webhook**: External API calls with configurable headers
- **Add tags**: Customer profile tagging

### Custom Node Implementation

Each node type has:
- Custom React component with Polaris design
- Type-specific handles and styling
- Configuration panel integration
- Validation logic in store

### Adding New Node Types

1. Create component in `src/components/nodes/`
2. Add to `nodeTypes` export in `src/components/nodes/index.ts`
3. Update `NodeType` union in `workflow.types.ts`
4. Add template to `nodeTemplates.ts`
5. Update validation logic in store if needed

## Drag and Drop System

- Templates dragged from left sidebar onto canvas
- Uses React DnD with React Flow integration
- Position calculated relative to canvas viewport
- New nodes created with unique IDs and default configuration

## Validation System

Workflow validation runs automatically and checks:
- At least one trigger node (error if none, warning if multiple)
- All non-trigger nodes have incoming connections
- Condition nodes have both "then" and "otherwise" branches connected
- Results displayed as errors/warnings in UI

## UI Features

### Collapsible Sidebars
- **Left Sidebar**: Node templates, auto-opens when entering builder
- **Right Sidebar**: Properties panel, auto-opens when selecting a node
- Both sidebars can be collapsed to maximize canvas workspace
- Smooth transitions with chevron indicators

### Workflow List Page
- Clickable workflow names for quick editing
- Filter by trigger type and status
- Search functionality
- Bulk actions (duplicate, delete, toggle status)
- Empty states with helpful prompts

### Canvas Features
- Auto-created start node for new workflows
- Visual connection validation
- Keyboard shortcuts for edge deletion
- Background grid and zoom controls
- No minimap for cleaner interface

## Polaris Integration

Complete Shopify Polaris integration:
- `AppProvider` wraps entire application
- Cards for node representations
- Badges for node status indicators
- Form components for node configuration
- Modals for save/load workflows
- Toast notifications for user feedback
- Links for clickable workflow names
- Consistent button and icon usage

## Deployment & CI/CD

### GitHub Actions Configuration

The project includes automated deployment via GitHub Actions (`.github/workflows/uat.yml`):

- **Trigger**: Push to `main` branch
- **Build Process**: 
  1. Install dependencies from root `package-lock.json`
  2. Run `npm run build:uat` (from root, navigates to workflow-builder)
  3. Deploy `workflow-builder/dist/` to AWS S3
  4. Invalidate CloudFront distribution
- **AWS Integration**: Uses OIDC for secure credential management
- **Environment**: UAT environment with specific S3 bucket and CloudFront distribution

### Deployment Commands

```bash
# From root directory
npm run build:uat           # Build for UAT environment
npm run build:production    # Build for production environment
npm run deploy:uat          # Build + Deploy to UAT S3 + Invalidate CloudFront
npm run deploy:production   # Build + Deploy to Production S3 + Invalidate CloudFront
```

### Environment Configuration

- `.env.uat` - UAT environment variables
- `.env.production` - Production environment variables  
- Vite build modes automatically load correct environment files

### Common Deployment Issues

1. **Missing Dependencies**: Ensure `npm install` runs from root directory
2. **Build Path**: GitHub Actions builds from root but deploys `workflow-builder/dist/`
3. **Cache Configuration**: GitHub Actions caches using root `package-lock.json`
4. **Port Management**: Dev server uses port 5173 exclusively - if port is busy, restart to clear cache

### AWS Resources

- **UAT S3 Bucket**: `rocket-mca-frontend-uat`
- **UAT CloudFront ID**: `EFJ0YRLCDZ0BQ`
- **IAM Role**: `rocket-uat-gtihub-oidc` (OIDC-based authentication)
- **Region**: `ap-southeast-1`

# deployment-reminders
This project uses npm workspaces - ALWAYS run commands from the root directory.
The GitHub Actions configuration has been fixed - dependencies install from root, builds run from workspace.
Do NOT create duplicate node_modules folders - only the root node_modules should exist.
Dev server uses port 5173 exclusively. If port is busy or cache needs clearing, stop the server and restart on port 5173.