# Project AI Rules

## Tech Stack
- **React 19**: Modern UI library for building components.
- **TypeScript**: Strict type checking for better developer experience and code quality.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS 4**: Utility-first CSS framework for rapid styling.
- **shadcn/ui**: High-quality, accessible UI components built on Radix UI.
- **TanStack React Query 5**: Powerful asynchronous state management and data fetching.
- **Zustand**: Small, fast, and scalable bearbones state-management solution.
- **React Router DOM 7**: Declarative routing for React applications.
- **Motion**: Production-ready motion library for React.
- **Recharts**: Redefined chart library built with React and D3.

## Library & Convention Rules

### Components & Structure
- **Source Code**: All source code must reside in the `src/` folder.
- **Pages**: Store page-level components in `src/pages/`.
- **Components**: Store reusable components in `src/components/`.
- **UI Components**: Use shadcn/ui components located in `src/components/ui/`. Do not edit these directly; wrap them if customization is needed.
- **Routing**: Keep routes defined in `src/App.tsx`.
- **Main Page**: `src/pages/Index.tsx` is the default landing page.

### Styling & UI
- **Tailwind CSS**: Always use Tailwind classes for styling. Avoid writing custom CSS files unless absolutely necessary.
- **Icons**: Use `lucide-react` for all icons.
- **Animations**: Use `motion` for transitions and complex animations.

### Data & State
- **Data Fetching**: Use `@tanstack/react-query` for all server-side data fetching, caching, and synchronization. Custom hooks should be placed in `src/hooks/queries/`.
- **Global State**: Use `zustand` for client-side global state management (e.g., UI states, user sessions). Store definitions should be in `src/store/`.
- **Types**: Define TypeScript interfaces and types in `src/types/`.

### Development Workflow
- **Simplicity**: Prioritize simple, readable code over complex abstractions.
- **Functionality**: Ensure every feature is fully functional and type-safe.
- **Feedback**: Use `console.log` sparingly and clean up after debugging.
