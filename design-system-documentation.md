# Design System Documentation: shadcn/ui with Apple Human Interface Guidelines

## Introduction

This design system combines the power of shadcn/ui components with Apple's Human Interface Guidelines to create a modern, elegant, and accessible SaaS interface. By leveraging pure shadcn/ui components built on Tailwind CSS and Radix UI primitives, we achieve a design language that emphasizes clarity, consistency, and user experience excellence.

The approach delivers several key advantages:

**Technical Foundation**: shadcn/ui provides production-ready components with built-in accessibility through Radix UI, while Tailwind CSS offers precise control over styling without CSS bloat.

**Design Philosophy**: Apple's HIG principles ensure our interface feels intuitive and refined, creating products that users understand immediately and appreciate long-term.

**Accessibility by Default**: The Radix UI foundation guarantees WCAG AA compliance out of the box, with proper focus management, keyboard navigation, and screen reader support.

**Maintainability**: Pure shadcn/ui components eliminate dependency complexity while providing a consistent API across all interface elements.

This documentation serves as the definitive guide for implementing interface patterns that balance technical excellence with human-centered design.

## 1. Core Principles from Apple HIG

### Clarity

Clarity is the primary principle driving every design decision. Text should be legible at every size, icons should be precise and meaningful, and functionality should be immediately apparent.

**Implementation Guidelines:**
- Use high contrast color combinations (minimum 4.5:1 ratio)
- Maintain generous white space around content areas
- Employ clear visual hierarchy through typography scale
- Ensure interactive elements have obvious affordances

### Depth

Depth creates visual layers that help users understand content relationships and navigation paths. Use subtle shadows, overlays, and spatial relationships to guide attention.

**Implementation Guidelines:**
- Apply consistent shadow patterns to establish layering
- Use backdrop blur effects for modal overlays
- Implement smooth transitions between interface states
- Create visual separation between content areas

### Deference

The interface should defer to content, never competing with or overwhelming the user's primary tasks. Visual elements should support functionality without becoming distracting.

**Implementation Guidelines:**
- Use neutral color palettes that let content shine
- Implement subtle borders and backgrounds
- Choose typography that enhances readability
- Design interactions that feel natural and unobtrusive

### Consistency

Consistent patterns reduce cognitive load and create predictable user experiences. Users should never wonder how interface elements will behave. Professional SaaS interfaces maintain this consistency by avoiding decorative elements like emojis that can disrupt visual harmony and create inconsistent user experiences across different platforms and devices.

**Implementation Guidelines:**
- Standardize component states across all contexts
- Use consistent spacing and sizing patterns
- Apply uniform interaction behaviors
- Maintain visual consistency in similar components
- Avoid emojis and decorative characters in favor of purpose-built iconography
- Use only shadcn/ui design tokens for all visual elements

### Motion

Motion should feel natural and purposeful, providing context for interface changes without being gratuitous or distracting.

**Implementation Guidelines:**
- Use easing curves that feel organic
- Keep transition durations brief but not rushed
- Ensure motion supports understanding of interface changes
- Provide motion preferences for accessibility

## 2. Design Consistency Guidelines

### Professional Interface Standards

Professional SaaS interfaces require a disciplined approach to visual consistency. This means making deliberate choices about every visual element to ensure the interface feels cohesive, trustworthy, and appropriate for business contexts.

### Why Emojis Should Be Avoided

Emojis, while expressive in casual communication, present several challenges in professional SaaS interfaces:

**Platform Inconsistency**
- Emojis render differently across operating systems (Apple, Google, Microsoft)
- Color variations and style differences create unpredictable visual experiences
- Some platforms may not support newer emoji characters

**Professional Perception**
- Business users expect polished, serious interfaces
- Emojis can undermine credibility and professional appearance
- They may not translate well across different cultural contexts

**Accessibility Concerns**
- Screen readers announce emoji descriptions that may not match visual intent
- Color-only information via emojis fails accessibility standards
- Cognitive load increases when users must interpret decorative elements

**Technical Limitations**
- Inconsistent sizing and alignment with text
- Limited customization options for theming
- Potential rendering issues in different browsers or devices

### Visual Consistency Using shadcn/ui Design Tokens

Maintain visual consistency by exclusively using shadcn/ui design tokens for all interface elements:

```tsx
// Consistent color usage across all components
const consistentCardStyle = {
  background: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))"
}

// Always use design system tokens
<Card className="bg-background border-border text-foreground">
  <CardHeader className="text-muted-foreground">
    <CardTitle className="text-foreground">Consistent Styling</CardTitle>
  </CardHeader>
</Card>
```

### Icon Usage Best Practices

Replace emojis with purposeful lucide-react icons that integrate seamlessly with your design system:

```tsx
import { CheckCircle, AlertTriangle, Info, XCircle, Plus, Settings } from "lucide-react"

// Status indicators using consistent iconography
const StatusIcon = ({ status }: { status: 'success' | 'warning' | 'info' | 'error' }) => {
  const iconMap = {
    success: <CheckCircle className="h-4 w-4 text-green-600" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    info: <Info className="h-4 w-4 text-blue-600" />,
    error: <XCircle className="h-4 w-4 text-red-600" />
  }
  
  return iconMap[status]
}

// Action buttons with consistent iconography
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Create Project
</Button>

<Button variant="outline">
  <Settings className="h-4 w-4 mr-2" />
  Settings
</Button>
```

### Consistent Spacing Guidelines

Maintain visual rhythm through consistent spacing patterns:

```tsx
// Standard spacing patterns
const spacingPatterns = {
  // Component internal spacing
  tight: "space-y-2",      // 8px - form fields, list items
  normal: "space-y-4",     // 16px - card content, sections
  relaxed: "space-y-6",    // 24px - major sections
  loose: "space-y-8",      // 32px - page sections
  
  // Padding patterns
  compact: "p-3",          // 12px - buttons, small cards
  standard: "p-4",         // 16px - cards, containers
  comfortable: "p-6",      // 24px - major containers
  spacious: "p-8"          // 32px - page sections
}

// Example implementation
<div className="space-y-6">  {/* Major sections */}
  <Card className="p-6">   {/* Comfortable container padding */}
    <div className="space-y-4"> {/* Normal content spacing */}
      <h2>Section Title</h2>
      <div className="space-y-2"> {/* Tight form spacing */}
        <Label>Field Label</Label>
        <Input />
      </div>
    </div>
  </Card>
</div>
```

### Typography Consistency

Use consistent typography patterns that establish clear hierarchy:

```tsx
// Consistent typography classes
const typographyScale = {
  // Headings
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
  
  // Body text
  body: "text-base",
  bodySmall: "text-sm",
  caption: "text-xs text-muted-foreground",
  
  // UI text
  button: "text-sm font-medium",
  label: "text-sm font-medium",
  placeholder: "text-sm text-muted-foreground"
}

// Implementation example
<div>
  <h1 className="text-3xl font-bold tracking-tight mb-4">
    Dashboard Overview
  </h1>
  <p className="text-base text-muted-foreground mb-6">
    Monitor your key metrics and recent activity.
  </p>
  <Button className="text-sm font-medium">
    View Details
  </Button>
</div>
```

### Color Usage Standards

Maintain consistent color application across all components:

```tsx
// Semantic color usage
const colorStandards = {
  // Text colors
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  disabled: "text-muted-foreground/50",
  
  // Background colors
  surface: "bg-background",
  elevated: "bg-card",
  subtle: "bg-muted",
  
  // Border colors
  default: "border-border",
  subtle: "border-border/50",
  emphasis: "border-foreground/20",
  
  // Status colors
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200"
}
```

## 3. Component Consistency Standards

### shadcn/ui Pattern Adherence

All custom components must follow established shadcn/ui patterns to maintain system integrity:

```tsx
// Correct: Following shadcn/ui patterns
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface CustomButtonProps extends ButtonProps {
  icon?: React.ReactNode
  loading?: boolean
}

const CustomButton = ({ icon, loading, children, className, disabled, ...props }: CustomButtonProps) => {
  return (
    <Button
      className={cn(className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </Button>
  )
}

// Incorrect: Breaking shadcn/ui patterns
const BadButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
      {children} 😊  {/* Emoji breaks consistency */}
    </div>
  )
}
```

### Standardized Component Variants

Implement consistent variant patterns across all components:

```tsx
// Size variants following consistent patterns
const sizeVariants = {
  sm: "h-8 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg"
}

// Color variants using design tokens
const colorVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
}

// State variants for consistency
const stateVariants = {
  default: "",
  loading: "opacity-50 cursor-not-allowed",
  disabled: "opacity-50 cursor-not-allowed",
  error: "border-destructive focus:ring-destructive",
  success: "border-green-500 focus:ring-green-500"
}
```

### Consistent Naming Conventions

Follow established naming patterns for props and classes:

```tsx
// Consistent prop naming
interface ComponentProps {
  // State props
  isLoading?: boolean      // Use "is" prefix for boolean states
  isDisabled?: boolean
  isActive?: boolean
  
  // Handler props
  onSubmit?: () => void    // Use "on" prefix for event handlers
  onChange?: (value: string) => void
  onClick?: () => void
  
  // Data props
  value?: string           // Direct naming for primary data
  defaultValue?: string    // "default" prefix for initial values
  placeholder?: string
  
  // Styling props
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string       // Always support className override
}

// Consistent class naming patterns
const classPatterns = {
  // Base component classes
  base: "inline-flex items-center justify-center rounded-md transition-colors",
  
  // Modifier classes
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  disabled: "disabled:pointer-events-none disabled:opacity-50",
  
  // Responsive classes
  responsive: "text-sm md:text-base lg:text-lg"
}
```

### Extending shadcn/ui Components

Maintain design system integrity when extending base components:

```tsx
// Correct: Extending while maintaining patterns
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  onEdit?: () => void
  className?: string
}

const ProjectCard = ({ title, description, status, onEdit, className }: ProjectCardProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4">{description}</p>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit Project
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Incorrect: Creating custom components that break patterns
const BadProjectCard = ({ title, status }: { title: string, status: string }) => {
  return (
    <div className="border rounded p-4 bg-white shadow">
      <h3 className="font-bold">{title}</h3>
      <span className="text-green-500">{status} ✅</span>  {/* Breaks design tokens and uses emoji */}
    </div>
  )
}
```

### Before/After Component Examples

**Inconsistent Component Usage (Before):**
```tsx
// Multiple problems: custom styling, emojis, inconsistent patterns
const InconsistentAlert = ({ type, message }: { type: string, message: string }) => {
  const getEmoji = () => {
    switch(type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }
  
  return (
    <div style={{ 
      padding: '12px', 
      backgroundColor: type === 'error' ? '#ffebee' : '#e8f5e8',
      border: '1px solid #ccc',
      borderRadius: '4px'
    }}>
      <span>{getEmoji()} {message}</span>
    </div>
  )
}
```

**Consistent Component Usage (After):**
```tsx
// Following shadcn/ui patterns with proper iconography
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConsistentAlertProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

const ConsistentAlert = ({ variant, children, className }: ConsistentAlertProps) => {
  const iconMap = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />
  }
  
  const variantStyles = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
    info: "border-blue-200 bg-blue-50 text-blue-800"
  }
  
  return (
    <Alert className={cn(variantStyles[variant], className)}>
      {iconMap[variant]}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
```

**Replacing Emojis with Lucide Icons:**
```tsx
// Before: Using emojis
const EmojiButton = () => (
  <button>Add Item ➕</button>
)

const EmojiStatus = ({ status }: { status: string }) => (
  <span>Status: {status === 'completed' ? '✅' : '⏳'}</span>
)

// After: Using lucide-react icons
import { Plus, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const IconButton = () => (
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Item
  </Button>
)

const IconStatus = ({ status }: { status: string }) => (
  <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="gap-1">
    {status === 'completed' ? (
      <CheckCircle className="h-3 w-3" />
    ) : (
      <Clock className="h-3 w-3" />
    )}
    {status}
  </Badge>
)
```

### Standardized Component Composition

Follow consistent patterns when composing multiple components:

```tsx
// Standard form composition pattern
const StandardForm = () => (
  <form className="space-y-6">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="Enter first name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Enter last name" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter email address" />
      </div>
    </div>
    
    <div className="flex gap-3 justify-end">
      <Button variant="outline">Cancel</Button>
      <Button type="submit">Save Changes</Button>
    </div>
  </form>
)

// Standard card layout pattern
const StandardCard = ({ title, description, actions }: {
  title: string
  description: string
  actions?: React.ReactNode
}) => (
  <Card>
    <CardHeader className={cn("pb-3", actions && "pb-2")}>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      {/* Card content */}
    </CardContent>
  </Card>
)
```

## 4. Tailwind Design Tokens

### Color Palette

Our color system draws inspiration from Apple's approach to color: sophisticated, accessible, and emotionally resonant.

```css
/* Primary Colors */
:root {
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-900: #0c4a6e;
}

/* Neutral Colors */
:root {
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-500: #737373;
  --neutral-800: #262626;
  --neutral-900: #171717;
}

/* Semantic Colors */
:root {
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --error-50: #fef2f2;
  --error-500: #ef4444;
}
```

### Spacing Scale

Consistent spacing creates visual rhythm and improves content scanability.

```css
/* Spacing tokens aligned with Apple's 8pt grid */
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Border Radius

Rounded corners should feel modern while maintaining clarity.

```css
:root {
  --radius-sm: 0.25rem;  /* 4px - subtle rounding */
  --radius-md: 0.375rem; /* 6px - standard elements */
  --radius-lg: 0.5rem;   /* 8px - cards and containers */
  --radius-xl: 0.75rem;  /* 12px - prominent elements */
}
```

### Typography Scale

Typography follows a modular scale that ensures proper hierarchy and readability.

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### Shadow System

Shadows create depth without overwhelming content.

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## 3. Pure shadcn/ui Components

### Button Component

Buttons are the primary mechanism for user actions. They should be immediately recognizable and provide clear feedback.

```tsx
import { Button } from "@/components/ui/button"

// Primary button - main actions
<Button className="bg-primary-600 hover:bg-primary-700 text-white font-medium">
  Create Project
</Button>

// Secondary button - supporting actions
<Button variant="outline" className="border-neutral-200 text-neutral-700 hover:bg-neutral-50">
  Cancel
</Button>

// Destructive button - dangerous actions
<Button variant="destructive" className="bg-error-500 hover:bg-error-600">
  Delete Account
</Button>

// Ghost button - minimal presence
<Button variant="ghost" className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
  Learn More
</Button>
```

### Card Component

Cards group related content and actions, providing clear boundaries and hierarchy.

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="shadow-md border-neutral-200 rounded-lg">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold text-neutral-900">
      Analytics Overview
    </CardTitle>
    <CardDescription className="text-sm text-neutral-600">
      Key metrics for the past 30 days
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-500">Total Users</p>
        <p className="text-2xl font-bold text-neutral-900">12,543</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-500">Revenue</p>
        <p className="text-2xl font-bold text-neutral-900">$45,230</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Dialog Component

Dialogs focus user attention on specific tasks without losing context of the underlying interface.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md border-neutral-200 shadow-xl">
    <DialogHeader className="pb-4">
      <DialogTitle className="text-lg font-semibold text-neutral-900">
        Account Settings
      </DialogTitle>
      <DialogDescription className="text-sm text-neutral-600">
        Manage your account preferences and security settings.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
  </DialogContent>
</Dialog>
```

### Input Component

Input fields should provide clear labeling, helpful placeholder text, and immediate validation feedback.

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
  />
</div>

// Error state
<div className="space-y-2">
  <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
    Password
  </Label>
  <Input
    id="password"
    type="password"
    className="border-error-500 focus:border-error-500 focus:ring-error-500"
  />
  <p className="text-sm text-error-600">Password must be at least 8 characters</p>
</div>
```

### Navigation Component

Navigation should provide clear wayfinding while maintaining a clean, uncluttered appearance.

```tsx
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  current: boolean
}

const NavigationMenu = ({ items }: { items: NavItem[] }) => (
  <nav className="space-y-1">
    {items.map((item) => (
      <a
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          item.current
            ? "bg-primary-100 text-primary-700"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
        )}
      >
        {item.name}
      </a>
    ))}
  </nav>
)
```

## 4. Layout and Responsiveness

### Dashboard Layout

Dashboard layouts should prioritize content hierarchy while maintaining visual balance across different screen sizes.

```tsx
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-neutral-50">
    {/* Header */}
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <Button size="sm">New Project</Button>
      </div>
    </header>
    
    {/* Main content */}
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  </div>
)

// Grid system for dashboard cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {dashboardCards.map((card) => (
    <Card key={card.id} className="shadow-sm">
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Table Layout

Tables should be scannable and responsive, with clear hierarchy and appropriate spacing.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<div className="rounded-lg border border-neutral-200 bg-white">
  <Table>
    <TableHeader>
      <TableRow className="border-b border-neutral-200">
        <TableHead className="font-semibold text-neutral-900">Name</TableHead>
        <TableHead className="font-semibold text-neutral-900">Status</TableHead>
        <TableHead className="font-semibold text-neutral-900">Created</TableHead>
        <TableHead className="font-semibold text-neutral-900">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {projects.map((project) => (
        <TableRow key={project.id} className="border-b border-neutral-100 hover:bg-neutral-50">
          <TableCell className="font-medium text-neutral-900">{project.name}</TableCell>
          <TableCell>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </TableCell>
          <TableCell className="text-neutral-600">{project.created}</TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">Edit</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Form Layout

Forms should guide users through data entry with clear structure and helpful feedback.

```tsx
<form className="space-y-6 max-w-md">
  <div className="space-y-4">
    <div>
      <Label htmlFor="project-name">Project Name</Label>
      <Input
        id="project-name"
        placeholder="Enter project name"
        className="mt-1"
      />
    </div>
    
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="Describe your project"
        className="mt-1 min-h-[100px]"
      />
    </div>
    
    <div>
      <Label htmlFor="category">Category</Label>
      <Select>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="web">Web Application</SelectItem>
          <SelectItem value="mobile">Mobile App</SelectItem>
          <SelectItem value="api">API Service</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
  
  <div className="flex gap-3">
    <Button type="submit" className="flex-1">Create Project</Button>
    <Button type="button" variant="outline">Cancel</Button>
  </div>
</form>
```

## 5. Motion and Interaction

### Transition Principles

Motion should feel natural and provide meaningful feedback about interface state changes.

```tsx
import { motion, AnimatePresence } from "framer-motion"

// Smooth entrance animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2, ease: "easeOut" }
}

// Card hover interactions
<motion.div
  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  <Card>
    {/* Card content */}
  </Card>
</motion.div>

// Modal animations
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-lg shadow-xl"
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Button Interactions

Buttons should provide immediate feedback while maintaining Apple's subtle interaction principles.

```tsx
// Subtle button press feedback
<motion.button
  whileTap={{ scale: 0.98 }}
  className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium"
>
  Submit
</motion.button>

// Loading state with spinner
<Button disabled={isLoading} className="min-w-[120px]">
  {isLoading ? (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
    />
  ) : (
    "Create Account"
  )}
</Button>
```

### List Animations

Staggered animations for list items create delightful micro-interactions.

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

<motion.ul
  variants={container}
  initial="hidden"
  animate="show"
  className="space-y-2"
>
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>
      <Card className="p-4">
        {item.content}
      </Card>
    </motion.li>
  ))}
</motion.ul>
```

## 6. Accessibility Standards

### Color Contrast

All color combinations must meet WCAG AA standards with a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.

```css
/* Verified contrast ratios */
.text-primary { color: #0284c7; } /* 4.52:1 on white */
.text-secondary { color: #525252; } /* 7.73:1 on white */
.text-error { color: #dc2626; } /* 5.9:1 on white */
.text-success { color: #059669; } /* 4.52:1 on white */
```

### Focus Management

Focus indicators should be clearly visible and follow consistent patterns.

```tsx
// Custom focus styles for consistency
const focusClasses = "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

<Button className={cn("...", focusClasses)}>
  Submit
</Button>

<Input className={cn("...", focusClasses)} />

// Focus trap for modals (handled by Radix UI)
<Dialog>
  <DialogContent>
    {/* Focus is automatically trapped within dialog */}
  </DialogContent>
</Dialog>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible with logical tab order.

```tsx
// Custom keyboard navigation for complex components
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusNextItem()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousItem()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectCurrentItem()
      break
    case 'Escape':
      event.preventDefault()
      closeMenu()
      break
  }
}

// Skip link for screen readers
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-md shadow-lg z-50"
>
  Skip to main content
</a>
```

### Screen Reader Support

Provide comprehensive labeling and context for assistive technologies.

```tsx
// Proper labeling and descriptions
<Button
  aria-label="Delete project"
  aria-describedby="delete-description"
>
  <TrashIcon className="w-4 h-4" />
</Button>
<div id="delete-description" className="sr-only">
  This action cannot be undone
</div>

// Live regions for dynamic content
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress"
>
  <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
</div>
```

## 7. Tone and Content Style

### Writing Principles

Follow Apple's approach to interface copy: be clear, human, direct, and professional.

**Be Clear**
- Use simple, everyday language
- Avoid technical jargon when possible
- Write in active voice
- Keep sentences concise

**Be Human**
- Write as if speaking to a colleague
- Show empathy for user situations
- Use "you" to address users directly
- Acknowledge when things go wrong

**Be Direct**
- Lead with the most important information
- Avoid unnecessary words
- Use specific rather than vague language
- Make actions clear and obvious

**Be Professional**
- Maintain consistent tone across all content
- Respect user time and intelligence
- Provide helpful context when needed
- Never blame users for errors

### Content Examples

**Button Labels**
```
Good: "Save Changes"
Poor: "Submit Form Data"

Good: "Delete Project"
Poor: "Remove This Item From Database"

Good: "Learn More"
Poor: "Click Here For Additional Information"
```

**Error Messages**
```
Good: "Please enter a valid email address"
Poor: "Invalid input detected in email field"

Good: "Your password must be at least 8 characters"
Poor: "Password validation failed - insufficient length"

Good: "Something went wrong. Please try again"
Poor: "An unexpected error has occurred in the system"
```

**Success Messages**
```
Good: "Project created successfully"
Poor: "New project entity has been added to the database"

Good: "Settings saved"
Poor: "Configuration parameters have been updated"

Good: "Welcome to your dashboard"
Poor: "You have successfully authenticated into the application"
```

**Help Text**
```
Good: "Choose a name that describes your project's purpose"
Poor: "Enter alphanumeric characters for the project identifier field"

Good: "We'll send updates to this email address"
Poor: "This field accepts valid email format strings"

Good: "This action cannot be undone"
Poor: "Irreversible operation - proceed with caution"
```

### Voice and Tone Guidelines

**Onboarding**: Welcoming and encouraging
- "Let's get you set up"
- "You're all ready to start"
- "Here's what you can do next"

**Error States**: Helpful and solution-focused
- "We couldn't find that file"
- "Let's try that again"
- "Here's how to fix this"

**Success States**: Positive but not overly enthusiastic
- "Your changes have been saved"
- "Upload complete"
- "You're all set"

**Empty States**: Encouraging and actionable
- "Create your first project"
- "No messages yet"
- "Add team members to get started"

## Implementation Guidelines

### Getting Started

1. **Install Dependencies**
   ```bash
   npm install @radix-ui/react-* tailwindcss framer-motion
   npx shadcn-ui@latest init
   ```

2. **Configure Tailwind**
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f0f9ff',
             500: '#0ea5e9',
             600: '#0284c7',
             900: '#0c4a6e',
           }
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
         }
       }
     }
   }
   ```

3. **Add Components**
   ```bash
   npx shadcn-ui@latest add button card dialog input table
   ```

### Design Review Checklist

Before implementing any component or pattern, verify it meets these criteria:

- **Clarity**: Is the purpose immediately obvious?
- **Consistency**: Does it follow established patterns?
- **Accessibility**: Does it meet WCAG AA standards?
- **Responsiveness**: Does it work across all screen sizes?
- **Performance**: Are animations smooth and purposeful?
- **Content**: Is the copy clear and helpful?

This design system provides the foundation for creating interfaces that feel both sophisticated and approachable, technical excellence and human understanding working together to create exceptional user experiences.

## Conclusion: Building Professional, Consistent Interfaces

By following these design consistency guidelines and component standards, you create interfaces that:

- **Build Trust**: Professional appearance without decorative distractions
- **Scale Effectively**: Consistent patterns work across teams and features
- **Remain Accessible**: Purpose-built iconography and semantic markup
- **Feel Cohesive**: Every element follows the same design language
- **Reduce Maintenance**: Standardized components minimize design debt

Remember: every design decision should serve the user's goals while maintaining the professional standards expected in SaaS applications. When in doubt, choose clarity and consistency over decoration and novelty.