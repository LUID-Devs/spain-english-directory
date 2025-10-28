# TaskLuid Frontend Documentation

A comprehensive Next.js 15 project management application built with TypeScript, Material-UI, and modern React patterns. TaskLuid provides a feature-rich platform for task management, project collaboration, and team coordination with integrated subscription management and AWS Cognito authentication.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [State Management](#state-management)
6. [Component Documentation](#component-documentation)
7. [Routing & Navigation](#routing--navigation)
8. [UI/UX Implementation](#uiux-implementation)
9. [API Integration](#api-integration)
10. [Subscription Management](#subscription-management)
11. [Development Setup](#development-setup)
12. [Build & Deployment](#build--deployment)
13. [Performance Considerations](#performance-considerations)
14. [Troubleshooting](#troubleshooting)

## Architecture Overview

TaskLuid follows a modern Next.js App Router architecture with client-side state management using Redux Toolkit Query. The application is structured as a single-page application (SPA) with server-side rendering capabilities.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Authentication Layer (AWS Cognito)                        │
├─────────────────────────────────────────────────────────────┤
│  State Management (Redux Toolkit + RTK Query)              │
├─────────────────────────────────────────────────────────────┤
│  UI Components (Material-UI + Custom Components)           │
├─────────────────────────────────────────────────────────────┤
│  Subscription Management (Stripe Integration)              │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Principles

- **Component-Driven Architecture**: Modular, reusable components with clear prop interfaces
- **Context-Based State Management**: Authentication and subscription contexts for cross-component data sharing
- **Progressive Enhancement**: Server-side rendering with client-side hydration
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities
- **Type Safety**: Full TypeScript implementation across all components and APIs

## Technology Stack

### Core Framework & Languages
- **Next.js 15.1.3**: React framework with App Router for SSR and routing
- **TypeScript 5**: Static type checking and enhanced developer experience
- **React 18**: Core UI library with concurrent features

### State Management & Data Fetching
- **Redux Toolkit 2.5.0**: Predictable state container
- **RTK Query**: Data fetching and caching solution
- **Redux Persist 6.0.0**: State persistence across sessions

### UI & Styling
- **Material-UI 6.3.1**: React component library
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 12.23.12**: Animation library
- **Lucide React**: Icon library

### Authentication & Payments
- **AWS Amplify 6.12.0**: Authentication integration
- **Stripe**: Payment processing and subscription management

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx        # Login form with MFA support
│   │   ├── register/page.tsx     # User registration
│   │   └── page.tsx              # Auth router
│   ├── dashboard/                # Protected dashboard area
│   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   ├── page.tsx              # Main dashboard
│   │   ├── projects/             # Project management views
│   │   ├── priority/             # Priority-based task views
│   │   ├── settings/             # User settings
│   │   ├── teams/                # Team management
│   │   ├── timeline/             # Timeline view
│   │   └── users/                # User management
│   ├── landing/                  # Landing page
│   ├── pricing/                  # Subscription pricing
│   ├── authProvider.tsx          # Authentication context
│   ├── dashboardWrapper.tsx      # Dashboard layout logic
│   ├── redux.tsx                 # Redux store provider
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── Header/                   # Page headers
│   ├── Modal/                    # Modal dialogs
│   ├── Navbar/                   # Navigation bar
│   ├── Sidebar/                  # Sidebar navigation
│   ├── TaskCard/                 # Task display cards
│   ├── ProjectCard/              # Project display cards
│   ├── UserCard/                 # User display cards
│   ├── ModalNewTask/             # Task creation modal
│   ├── subscription/             # Subscription components
│   └── ui/                       # Base UI components
├── contexts/                     # React contexts
│   └── SubscriptionContext.tsx   # Subscription state management
├── hooks/                        # Custom React hooks
│   ├── useAuthToken.ts           # Authentication token management
│   └── useAuthenticatedApi.ts    # Authenticated API calls
├── lib/                          # Utility libraries
│   ├── stripe.ts                 # Stripe configuration
│   ├── subscription-api.ts       # Subscription API calls
│   └── utils.ts                  # General utilities
└── state/                        # Redux state management
    ├── api.ts                    # RTK Query API definitions
    └── index.ts                  # Global state slices
```

## Authentication System

TaskLuid implements a robust authentication system using AWS Cognito with support for multi-factor authentication (MFA).

### Authentication Flow

1. **Login Process**: Users authenticate via username/password
2. **MFA Challenge**: Optional SMS or TOTP-based verification
3. **Session Management**: Secure session handling with HTTP-only cookies
4. **Auto-Redirect**: Automatic redirection to appropriate pages based on auth status

### AuthProvider Component

Located at `/src/app/authProvider.tsx`, this context provider handles:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}
```

**Key Features:**
- Automatic auth status checking on app load
- Timeout handling for auth requests (3-second timeout)
- Error boundary for failed authentication
- Loading states with user feedback
- Automatic redirect to login for unauthenticated users

### Protected Routes

The dashboard layout (`/src/app/dashboard/layout.tsx`) wraps all protected content with the AuthProvider, ensuring only authenticated users can access the application.

### Implementation Example

```typescript
// Usage in components
const { user, isAuthenticated, logout } = useAuth();

if (!isAuthenticated) {
  return <div>Please log in to access this content</div>;
}
```

## State Management

TaskLuid uses Redux Toolkit with RTK Query for comprehensive state management and data fetching.

### Redux Store Structure

```typescript
// Root state shape
interface RootState {
  global: {
    isSidebarCollapsed: boolean;
    isDarkMode: boolean;
  };
  api: {
    // RTK Query cache and state
  };
}
```

### Global State Slice

Located at `/src/state/index.ts`:

```typescript
const globalSlice = createSlice({
  name: "global",
  initialState: {
    isSidebarCollapsed: false,
    isDarkMode: false,
  },
  reducers: {
    setIsSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});
```

### RTK Query API

The API layer (`/src/state/api.ts`) defines all backend interactions:

**Available Endpoints:**
- `getProjects`: Fetch all projects
- `createProject`: Create new project
- `getTasks`: Fetch tasks by project ID
- `createTask`: Create new task
- `updateTaskStatus`: Update task status
- `getUsers`: Fetch all users
- `getTeams`: Fetch all teams
- `search`: Global search functionality

**Example Usage:**
```typescript
const { data: projects, isLoading, error } = useGetProjectsQuery();
const [createProject] = useCreateProjectMutation();
```

### State Persistence

Redux Persist maintains state across browser sessions:
- Whitelist: `["global"]` - Only UI preferences are persisted
- Storage: localStorage for client-side persistence
- SSR Compatibility: NoOp storage for server-side rendering

## Component Documentation

### Core Layout Components

#### Navbar (`/src/components/Navbar/index.tsx`)

**Purpose**: Top navigation bar with user actions and search functionality

**Key Features:**
- User profile dropdown with authentication actions
- Global search bar with real-time feedback
- Theme toggle (light/dark mode)
- Settings navigation
- Responsive design with mobile optimizations

**Props**: None (uses global state and auth context)

**Dependencies:**
- `useAuth()`: Authentication context
- `useAppSelector()`: Redux state access
- `framer-motion`: Animations

#### Sidebar (`/src/components/Sidebar/index.tsx`)

**Purpose**: Left navigation panel with project and priority-based navigation

**Key Features:**
- Collapsible sidebar with smooth transitions
- Dynamic project list from API
- Priority-based task navigation
- Team information display
- Mobile-responsive behavior

**State Management:**
- `showProjects`: Toggle project list visibility
- `showPriority`: Toggle priority list visibility
- `isSidebarCollapsed`: Global sidebar state

#### DashboardWrapper (`/src/app/dashboardWrapper.tsx`)

**Purpose**: Layout orchestrator for the dashboard area

**Responsibilities:**
- Redux store provider integration
- Dark mode theme application
- Sidebar and navbar coordination
- Responsive layout management

### Data Display Components

#### TaskCard (`/src/components/TaskCard/index.tsx`)

**Purpose**: Individual task display component

**Props:**
```typescript
interface Props {
  task: Task;
}
```

**Displayed Information:**
- Task ID, title, and description
- Status and priority indicators
- Start and due dates (formatted)
- Author and assignee information
- Attachment previews (with S3 integration)

#### ProjectCard (`/src/components/ProjectCard/index.tsx`)

**Purpose**: Project overview display

**Features:**
- Project metadata display
- Navigation to project details
- Visual indicators for project status

### Modal Components

#### ModalNewTask (`/src/components/ModalNewTask/index.tsx`)

**Purpose**: Task creation interface

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string; // Project ID
}
```

**Form Fields:**
- Task title and description
- Priority and status selection
- Date range selection
- Assignee selection
- File attachments

### Project Views

The application provides multiple views for project management:

#### BoardView (`/src/app/dashboard/projects/BoardView/index.tsx`)
- Kanban-style board with drag-and-drop
- Status-based columns
- Real-time updates

#### ListView (`/src/app/dashboard/projects/ListView/index.tsx`)
- Tabular task display
- Sorting and filtering capabilities
- Bulk actions

#### Timeline (`/src/app/dashboard/projects/Timeline/index.tsx`)
- Gantt chart visualization
- Date-based task planning
- Dependencies visualization

#### Table (`/src/app/dashboard/projects/Table/index.tsx`)
- Data grid with Material-UI DataGrid
- Advanced filtering and sorting
- Export capabilities

## Routing & Navigation

TaskLuid uses Next.js App Router for file-based routing with nested layouts.

### Route Structure

```
/                           # Redirects to /dashboard
/auth/
  /login                    # Login page
  /register                 # Registration page
/dashboard/                 # Protected dashboard area
  /                         # Main dashboard
  /projects/
    /[id]                   # Project detail view
  /priority/
    /urgent                 # Urgent tasks
    /high                   # High priority tasks
    /medium                 # Medium priority tasks
    /low                    # Low priority tasks
    /backlog                # Backlog tasks
  /search                   # Global search results
  /settings                 # User settings
  /teams                    # Team management
  /timeline                 # Timeline view
  /users                    # User management
/landing                    # Marketing landing page
/pricing                    # Subscription pricing
```

### Route Protection

**Authentication Guards:**
- All `/dashboard/*` routes require authentication
- Automatic redirect to `/auth/login` for unauthenticated access
- Loading states during authentication verification

**Layout Hierarchy:**
```
RootLayout (app/layout.tsx)
└── DashboardLayout (app/dashboard/layout.tsx)
    ├── AuthProvider
    ├── SubscriptionProvider
    └── DashboardWrapper
        ├── Sidebar
        ├── Navbar
        └── Page Content
```

### Navigation Components

#### SidebarLink

```typescript
interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}
```

**Features:**
- Active state highlighting
- Icon and text display
- Hover animations
- Accessibility support

### Priority-Based Routing

The priority system uses a reusable component pattern:

```typescript
// /src/app/dashboard/priority/reusablePriorityPage/index.tsx
const PriorityPage = ({ priority }: { priority: Priority }) => {
  // Shared logic for all priority views
};
```

Each priority route imports this component with the appropriate priority level.

## UI/UX Implementation

### Design System

TaskLuid implements a cohesive design system with dark mode support and responsive design patterns.

#### Color Palette

```css
/* Tailwind Custom Colors */
colors: {
  "dark-bg": "#101214",
  "dark-secondary": "#1d1f21", 
  "dark-tertiary": "#3b3d40",
  "blue-primary": "#0275ff",
  "stroke-dark": "#2d3135",
}
```

#### Typography

- **Primary Font**: Geist Sans (Vercel's custom font)
- **Monospace Font**: Geist Mono
- **Font Sizes**: Tailwind's type scale (text-sm as base)

### Theme System

#### Dark Mode Implementation

**Global State Management:**
```typescript
const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

// Theme application
useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [isDarkMode]);
```

**CSS Class Strategy:**
```css
/* Light mode */
.bg-white

/* Dark mode */
.dark:bg-dark-bg
```

### Responsive Design

#### Breakpoint Strategy

- **Mobile First**: Base styles for mobile devices
- **Tablet**: `md:` prefix for tablet adaptations
- **Desktop**: `lg:` and `xl:` prefixes for larger screens

#### Component Responsiveness

**Sidebar Behavior:**
- Mobile: Hidden by default, overlay when opened
- Tablet/Desktop: Fixed sidebar with collapse toggle

**Navigation:**
- Mobile: Hamburger menu, condensed user info
- Desktop: Full navigation with user profile dropdown

### Animation System

#### Framer Motion Integration

**Page Transitions:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Page content */}
</motion.div>
```

**Interactive Elements:**
- Hover effects with scale transforms
- Loading animations for async operations
- Smooth transitions for state changes

#### CSS Animations

**Loading Spinners:**
```css
.animate-spin
```

**Custom Animations:**
- Sidebar collapse/expand
- Modal fade in/out
- Button hover effects

### Material-UI Integration

#### Custom Theme Configuration

```typescript
// DataGrid styling for dark mode
const dataGridSxStyles = (isDarkMode: boolean) => ({
  "& .MuiDataGrid-columnHeaders": {
    color: isDarkMode ? "#e5e7eb" : "",
    backgroundColor: isDarkMode ? "#1d1f21" : "white",
  },
  // Additional styling...
});
```

#### Component Customization

- **DataGrid**: Custom styling for dark mode compatibility
- **Form Components**: Consistent styling with Tailwind
- **Icons**: Lucide React for consistent iconography

## API Integration

### Base Configuration

```typescript
// RTK Query base configuration
export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include' // For cookie-based authentication
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    // Endpoint definitions...
  }),
});
```

### Data Types

#### Core Entities

```typescript
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}
```

#### Enums

```typescript
export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress", 
  UnderReview = "Under Review",
  Completed = "Completed",
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}
```

### API Endpoints

#### Project Management

```typescript
// Get all projects
const { data: projects } = useGetProjectsQuery();

// Create new project
const [createProject] = useCreateProjectMutation();
await createProject({ name: "New Project", description: "..." });
```

#### Task Management

```typescript
// Get tasks for a project
const { data: tasks } = useGetTasksQuery({ projectId: 1 });

// Create new task
const [createTask] = useCreateTaskMutation();
await createTask({
  title: "Task Title",
  projectId: 1,
  priority: Priority.High,
  status: Status.ToDo
});

// Update task status
const [updateTaskStatus] = useUpdateTaskStatusMutation();
await updateTaskStatus({ taskId: 1, status: "Completed" });
```

#### Search Functionality

```typescript
const { data: searchResults } = useSearchQuery("search term");
// Returns: { tasks?: Task[], projects?: Project[], users?: User[] }
```

### Error Handling

#### RTK Query Error Management

```typescript
const { data, error, isLoading } = useGetProjectsQuery();

if (error) {
  // Error state handling
  console.error('Failed to fetch projects:', error);
}
```

#### Authentication Errors

```typescript
// AuthProvider handles auth failures
try {
  const response = await fetch('/api/endpoint', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Request failed');
  }
} catch (error) {
  // Automatic redirect to login on auth errors
}
```

### Caching Strategy

#### Automatic Cache Invalidation

```typescript
// RTK Query automatically manages cache invalidation
tagTypes: ["Projects", "Tasks", "Users", "Teams"],

// Mutations invalidate relevant cache entries
createProject: build.mutation({
  query: (project) => ({ url: "projects", method: "POST", body: project }),
  invalidatesTags: ["Projects"], // Refetches project queries
}),
```

## Subscription Management

TaskLuid integrates Stripe for subscription management with usage-based limitations.

### Subscription Context

```typescript
interface SubscriptionContextType {
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canCreateTask: () => Promise<{ canCreate: boolean; reason?: string; upgradeRequired?: boolean }>;
  isSubscribed: boolean;
  isPremium: boolean;
  currentPlan: SubscriptionPlan | null;
}
```

### Subscription Plans

```typescript
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    taskLimit: 5,
    features: ['5 tasks', 'Basic support']
  },
  PRO: {
    name: 'Pro', 
    price: 1999, // $19.99 in cents
    taskLimit: 100,
    features: ['100 tasks', 'Priority support', 'Advanced features']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 4999, // $49.99 in cents
    taskLimit: -1, // Unlimited
    features: ['Unlimited tasks', 'Premium support', 'Custom integrations']
  }
};
```

### Usage Gates

#### Task Creation Limits

```typescript
const { canCreateTask } = useSubscription();

const handleCreateTask = async () => {
  const { canCreate, reason, upgradeRequired } = await canCreateTask();
  
  if (!canCreate) {
    if (upgradeRequired) {
      // Show upgrade modal
    } else {
      // Show error message
    }
    return;
  }
  
  // Proceed with task creation
};
```

### Stripe Integration

#### Payment Form Component

Located at `/src/components/subscription/PaymentForm.tsx`:

```typescript
// Stripe Elements integration
<Elements stripe={stripePromise}>
  <PaymentForm onSuccess={handlePaymentSuccess} />
</Elements>
```

#### Subscription Dashboard

The subscription dashboard (`/src/components/subscription/SubscriptionDashboard.tsx`) provides:

- Current plan information
- Usage statistics
- Billing history
- Plan upgrade/downgrade options

### API Integration

```typescript
// Subscription API calls
export const subscriptionApi = {
  getCurrentSubscription: async (): Promise<SubscriptionData> => {
    // Fetch current subscription status
  },
  
  checkTaskCreation: async (): Promise<{canCreate: boolean}> => {
    // Check if user can create more tasks
  },
  
  createCheckoutSession: async (priceId: string): Promise<{url: string}> => {
    // Create Stripe checkout session
  }
};
```

## Development Setup

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Git**: For version control

### Environment Configuration

Create a `.env.local` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# AWS Cognito Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Optional: Development flags
NODE_ENV=development
```

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd task-luid-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",           # Start development server
    "build": "next build",       # Build production bundle
    "start": "next start",       # Start production server
    "lint": "next lint"          # Run ESLint
  }
}
```

### Code Quality Tools

#### ESLint Configuration

```javascript
// eslint.config.mjs
export default [
  {
    extends: ["next/core-web-vitals"],
    rules: {
      // Custom rules
    }
  }
];
```

#### Prettier Configuration

```javascript
// prettier.config.js
module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  // Additional configuration
};
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Implement components with TypeScript
   - Add proper error handling
   - Test in development environment

2. **Code Review Process**
   - Run linting: `npm run lint`
   - Test build: `npm run build`
   - Manual testing of new features
   - Submit pull request

3. **Testing Strategy**
   - Component unit testing (setup required)
   - Integration testing with API
   - Manual testing across devices
   - Performance testing

## Build & Deployment

### Production Build

#### Build Process

```bash
# Create optimized production build
npm run build

# Start production server locally
npm start
```

#### Build Optimization

Next.js automatically optimizes the build:

- **Code Splitting**: Automatic page-based code splitting
- **Image Optimization**: Next.js Image component with WebP conversion
- **Bundle Analysis**: Use `@next/bundle-analyzer` for bundle size analysis
- **Static Generation**: Pre-rendered pages where possible

### Deployment Options

#### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables
   - Set up automatic deployments

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.taskluid.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   # Additional production variables
   ```

3. **Domain Configuration**
   - Custom domain setup
   - SSL certificate (automatic)
   - CDN distribution

#### Self-Hosted Deployment

1. **Docker Deployment**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Server Configuration**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start application
   pm2 start npm --name "taskluid-web" -- start
   ```

### Environment-Specific Configuration

#### Development
- Hot reloading enabled
- Debug logging active
- Development API endpoints
- Mock data where appropriate

#### Staging
- Production build with development APIs
- Feature flag testing
- Performance monitoring
- User acceptance testing

#### Production
- Optimized build
- Production API endpoints
- Error tracking enabled
- Performance monitoring
- CDN distribution

### Performance Optimization

#### Image Optimization

```typescript
// Optimized image loading
<Image
  src="/images/example.jpg"
  alt="Description"
  width={300}
  height={200}
  priority={true} // For above-the-fold images
/>
```

#### Bundle Optimization

```javascript
// next.config.mjs
const nextConfig = {
  // Disable strict mode for production (if needed)
  reactStrictMode: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "luid-pm-s3-images.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      }
    ]
  },
  
  // Additional optimizations
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  }
};
```

### Monitoring & Analytics

#### Performance Monitoring

- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Regular bundle size monitoring
- **Runtime Performance**: React DevTools Profiler
- **Network Performance**: API response time monitoring

#### Error Tracking

- **Client-Side Errors**: Implement error boundaries
- **API Errors**: Centralized error handling
- **User Experience**: Error reporting and recovery

## Performance Considerations

### Current Performance Profile

#### Bundle Size Optimization

**Key Metrics:**
- Initial bundle size: ~200KB (gzipped)
- Code splitting: Page-based automatic splitting
- Dynamic imports: Used for modals and heavy components

**Optimization Strategies:**
```typescript
// Dynamic imports for heavy components
const ModalNewTask = dynamic(() => import('@/components/ModalNewTask'), {
  loading: () => <div>Loading...</div>
});
```

#### State Management Performance

**Redux Optimization:**
- Selective state subscriptions with `useAppSelector`
- RTK Query caching reduces API calls
- State persistence limited to essential data (UI preferences only)

**Memory Management:**
```typescript
// Efficient state selection
const isSidebarCollapsed = useAppSelector(
  (state) => state.global.isSidebarCollapsed
);
// vs. selecting entire state
```

### Rendering Performance

#### React Optimization Patterns

**Memo Usage:**
```typescript
// Memoize expensive components
const TaskCard = React.memo(({ task }: Props) => {
  // Component implementation
});
```

**Callback Optimization:**
```typescript
// Stabilize callback references
const handleTaskUpdate = useCallback((taskId: number, status: string) => {
  updateTaskStatus({ taskId, status });
}, [updateTaskStatus]);
```

#### Animation Performance

**Framer Motion Optimization:**
- Hardware acceleration for transforms
- Reduced motion preferences support
- Efficient animation cleanup

```typescript
// Optimized animations
<motion.div
  animate={{ x: 0 }}
  transition={{ type: "spring", damping: 20 }}
  style={{ willChange: "transform" }} // Hardware acceleration hint
>
```

### Network Performance

#### API Optimization

**RTK Query Caching:**
- Automatic cache invalidation
- Background refetching
- Optimistic updates for better UX

**Request Optimization:**
```typescript
// Batch API calls where possible
const { data: projects } = useGetProjectsQuery();
const { data: teams } = useGetTeamsQuery();
// Both requests can be made in parallel
```

#### Image Loading

**Next.js Image Optimization:**
- Automatic WebP conversion
- Responsive image loading
- Lazy loading by default

```typescript
<Image
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  placeholder="blur" // Loading placeholder
  blurDataURL="data:image/jpeg;base64,..." // Base64 placeholder
/>
```

### Performance Monitoring

#### Core Web Vitals

**Tracking Implementation:**
```typescript
// Monitor performance metrics
export function reportWebVitals(metric: any) {
  console.log(metric);
  // Send to analytics service
}
```

**Key Metrics:**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Bundle Analysis

```bash
# Analyze bundle size
npm install @next/bundle-analyzer
npm run analyze
```

### Optimization Checklist

#### Development Phase
- [ ] Use React.memo for expensive components
- [ ] Implement proper useCallback/useMemo usage
- [ ] Minimize bundle size with dynamic imports
- [ ] Optimize image loading with Next.js Image
- [ ] Implement proper error boundaries

#### Build Phase
- [ ] Run bundle analyzer
- [ ] Check Core Web Vitals scores
- [ ] Verify image optimization
- [ ] Test on various network conditions
- [ ] Monitor runtime performance

#### Deployment Phase
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up performance monitoring
- [ ] Implement error tracking
- [ ] Monitor real-user metrics

## Troubleshooting

### Common Development Issues

#### Authentication Problems

**Issue**: Authentication context returns null user
```typescript
// Debug authentication state
console.log('[AUTH] Current auth state:', {
  user: auth.user,
  isAuthenticated: auth.isAuthenticated,
  isLoading: auth.isLoading
});
```

**Solutions:**
1. Check API endpoint connectivity
2. Verify CORS configuration
3. Ensure cookies are being sent (`credentials: 'include'`)
4. Check browser network tab for failed requests

#### State Management Issues

**Issue**: Redux state not persisting
```typescript
// Check persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global"], // Ensure global state is whitelisted
};
```

**Solutions:**
1. Clear browser localStorage
2. Check redux-persist configuration
3. Verify storage availability
4. Review state shape compatibility

#### API Integration Problems

**Issue**: RTK Query requests failing
```typescript
// Debug API configuration
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Request headers:', {
  'Content-Type': 'application/json',
  credentials: 'include'
});
```

**Solutions:**
1. Verify environment variables
2. Check network connectivity
3. Review CORS policies
4. Validate request/response formats

### Build and Deployment Issues

#### Next.js Build Failures

**Issue**: TypeScript compilation errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Solutions:**
1. Fix TypeScript errors
2. Update type definitions
3. Check import/export statements
4. Verify component prop types

#### Environment Variable Issues

**Issue**: Environment variables not available in build
```typescript
// Verify environment variable access
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL
});
```

**Solutions:**
1. Ensure variables prefixed with `NEXT_PUBLIC_`
2. Check `.env.local` file location
3. Verify deployment platform environment configuration
4. Restart development server after adding variables

### Performance Issues

#### Slow Page Loading

**Diagnostic Steps:**
```bash
# Build and analyze bundle
npm run build
npm run start

# Check bundle composition
npm install @next/bundle-analyzer
npm run analyze
```

**Solutions:**
1. Implement dynamic imports for heavy components
2. Optimize image sizes and formats
3. Review API response times
4. Check for memory leaks in React components

#### Subscription Context Loading

**Issue**: Subscription data loading indefinitely
```typescript
// Debug subscription loading
useEffect(() => {
  console.log('[SUBSCRIPTION] Loading state:', {
    loading,
    subscriptionData,
    error
  });
}, [loading, subscriptionData, error]);
```

**Solutions:**
1. Check subscription API endpoint
2. Verify authentication for subscription requests
3. Review timeout configurations
4. Implement fallback subscription state

### Production Issues

#### Authentication Redirects

**Issue**: Users stuck in redirect loop
```typescript
// Check redirect logic
useEffect(() => {
  if (!isLoading && !user) {
    console.log('[AUTH] Redirecting to login');
    router.push('/auth/login');
  }
}, [isLoading, user, router]);
```

**Solutions:**
1. Review authentication flow logic
2. Check for infinite redirect conditions
3. Verify session handling
4. Clear browser cookies/localStorage

#### Stripe Integration Issues

**Issue**: Payment processing failures
```typescript
// Debug Stripe configuration
console.log('Stripe configuration:', {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10),
  hasStripePromise: !!stripePromise
});
```

**Solutions:**
1. Verify Stripe API keys
2. Check webhook configuration
3. Review payment method setup
4. Validate subscription plan configuration

### Debugging Tools

#### Development Tools

**React Developer Tools:**
- Component tree inspection
- Props and state debugging
- Performance profiling

**Redux DevTools:**
- State inspection
- Action debugging
- Time-travel debugging

**Browser DevTools:**
- Network request monitoring
- Performance profiling
- Console error tracking

#### Logging Strategy

```typescript
// Structured logging for debugging
const logger = {
  auth: (message: string, data?: any) => {
    console.log(`[AUTH] ${message}`, data);
  },
  api: (message: string, data?: any) => {
    console.log(`[API] ${message}`, data);
  },
  subscription: (message: string, data?: any) => {
    console.log(`[SUBSCRIPTION] ${message}`, data);
  }
};
```

### Getting Help

#### Development Support

**Documentation Resources:**
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Redux Toolkit: [https://redux-toolkit.js.org/](https://redux-toolkit.js.org/)
- Material-UI: [https://mui.com/](https://mui.com/)
- Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

**Community Support:**
- Stack Overflow for technical questions
- GitHub Issues for bug reports
- Discord/Slack for real-time help

**Internal Documentation:**
- API documentation (backend repository)
- Design system guidelines
- Deployment runbooks

---

## Contributing

### Development Guidelines

1. **Code Style**: Follow ESLint and Prettier configurations
2. **TypeScript**: Maintain strict type safety
3. **Component Design**: Create reusable, well-documented components
4. **Performance**: Consider performance implications of changes
5. **Testing**: Add tests for new features (when testing framework is set up)

### Pull Request Process

1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Test changes locally
4. Update documentation if necessary
5. Submit pull request with clear description

---

This documentation provides a comprehensive guide to the TaskLuid frontend application. For specific implementation details or troubleshooting not covered here, please refer to the component source code or reach out to the development team.