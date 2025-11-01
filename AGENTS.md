# Agent Guidelines for 402 Chat

- DO NOT run pnpm build while the dev server is running to avoid interruption, instead run pnpm lint and pnpn fix after code changes

## UI Components & Styling

### Components

- **shadcn/ui**: Use shadcn components for all UI elements
- **Component location**: Place shadcn components in the standard location (typically `components/ui/`)
- **Customization**: Customize shadcn components through Tailwind classes when needed
- **Check for existing components first**: Before adding custom code or new components:
  - Search the `components/` directory for existing reusable components that solve or partially solve the task
  - If an exact component doesn't exist, evaluate whether a small adaptation or evolution of an existing component can fulfill the requirement
  - Prefer extending/adapting existing components over creating new ones to maintain consistency and reduce code duplication

### Styling

- **Tailwind CSS**: Use the latest version of Tailwind for all styling
- **Utility-first approach**: Prefer Tailwind utility classes over custom CSS
- **Theme colors**: Centralize all theme colors in one place (typically `tailwind.config.ts`)
- **Light & Dark modes**: Support both light and dark modes for all components
  - Use Tailwind's dark mode utilities (`dark:`)
  - Ensure theme colors work in both modes
  - Test all UI in both themes

## React Patterns

### Server vs Client Components

- **Prefer Server Side Rendering (SSR)**: Always use server components when possible
- **Client components**: Only use `"use client"` directive when absolutely necessary:
  - Interactive elements requiring hooks
  - Browser-only APIs
  - Event handlers
  - Context providers

### React Best Practices

- **Minimize `useEffect()`**: Only use `useEffect()` when absolutely necessary
  - Prefer server-side data fetching in Server Components
  - Use Server Actions for mutations
  - Consider if the effect is truly necessary
- **Component composition**: Build reusable, composable components
- **Props typing**: Always strongly type component props with interfaces or types

## Data Fetching & State Management

### Server Components & Server Actions

- **Server Components**: Use React Server Components for data fetching by default
  - Fetch data directly in server components using async/await
  - Pass fetched data to client components as props
  - Server components automatically handle loading and error states
- **Server Actions**: Use Server Actions for all mutations (create, update, delete)
  - Mark functions with `"use server"` directive
  - Call server actions from client components
  - Use `revalidatePath()` or `revalidateTag()` to refresh data after mutations
- **Type safety**: Maintain strong types for all data operations
- **Error handling**: Handle all errors gracefully with proper user feedback
- **Loading states**: Use `useTransition()` in client components for loading states

## Database

### Drizzle ORM with PostgreSQL

This project uses **Drizzle ORM** exclusively for type-safe database operations with PostgreSQL.

- **Database**: PostgreSQL (via Supabase, Neon, Railway, or any provider)
- **ORM**: Drizzle ORM provides type-safe queries and schema management
- **Migrations**: Drizzle Kit for generating and managing migrations
- **Type Safety**: Full TypeScript support with inferred types

### Database Client Usage

**Server Components & Server Actions:**

- Use the `db` client from `@/db/client` for all database operations
- Import schema types from `@/db/schema`
- Use Drizzle's query builder for type-safe queries

```tsx
// In a Server Component
import { db } from "@/db/client";
import { comments } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function Page() {
  const data = await db
    .select()
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .limit(10);

  return <div>{/* render data */}</div>;
}
```

**Server Actions for Mutations:**

```tsx
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { comments } from "@/db/schema";

export async function createComment(text: string) {
  await db.insert(comments).values({ text });
  revalidatePath("/"); // Refresh the page data
}
```

### Database Best Practices

- **Server-side only**: All database operations must happen in Server Components or Server Actions
- **Type safety**: Leverage Drizzle's type inference for queries and mutations
- **Migrations**: Use `pnpm drizzle-kit generate` to create migrations from schema changes
- **Revalidation**: Always use `revalidatePath()` or `revalidateTag()` after mutations to refresh data
- **Error handling**: Always handle database errors gracefully with try-catch blocks
- **No client-side DB access**: Never import or use the database client in client components

## File Organization

- **Colocation**: Keep related files close together
- **Named exports**: Prefer named exports over default exports for better refactoring
- **Index files**: Use index files sparingly, only when they improve organization

## Code Style

- **Functional components**: Use functional components exclusively
- **Arrow functions**: Prefer arrow functions for consistency
- **Async/await**: Use async/await over promise chains
- **Destructuring**: Use destructuring for props and objects when appropriate
- **Early returns**: Use early returns to reduce nesting

## Examples

### Good: Server Component with Server-Side Data

```tsx
// app/dashboard/page.tsx
import { fetchData } from "@/lib/api";

export default async function DashboardPage() {
  const data = await fetchData();

  return (
    <div className="container dark:bg-slate-900">
      <h1 className="text-2xl dark:text-white">{data.title}</h1>
    </div>
  );
}
```

### Good: Server Component with Data Fetching

```tsx
// Server Component - no "use client" needed
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface UserStatsProps {
  userId: string;
}

export async function UserStats({ userId }: UserStatsProps) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) return <div>User not found</div>;

  return <div>{/* render stats */}</div>;
}
```

### Good: Client Component with Server Action

```tsx
"use client";

import { useState, useTransition } from "react";
import { updateUserName } from "@/lib/actions/users";

export function UpdateNameForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateUserName(name);
      setName("");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button disabled={isPending}>
        {isPending ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
```

### Bad: Using `any` and unnecessary `useEffect`

```tsx
// ❌ Don't do this
"use client";

import { useEffect, useState } from "react";

export function BadComponent({ data }: { data: any }) {
  // ❌ Never use any
  const [state, setState] = useState(null);

  useEffect(() => {
    // ❌ Avoid useEffect for data fetching
    // This should be done in a Server Component
    fetch("/api/data")
      .then((res) => res.json())
      .then(setState);
  }, []);

  return <div>{state}</div>;
}
```

## Accessibility

- **Semantic HTML**: Use proper HTML5 semantic elements
- **ARIA labels**: Add appropriate ARIA labels when needed
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Color contrast**: Maintain sufficient color contrast in both light and dark modes

## Performance

- **Code splitting**: Leverage Next.js automatic code splitting
- **Dynamic imports**: Use dynamic imports for heavy components
- **Image optimization**: Use Next.js `Image` component for all images
- **Bundle size**: Be mindful of bundle size when adding dependencies

## Testing

- **Type safety first**: Let TypeScript catch errors at compile time
- **Test critical paths**: Write tests for critical user flows and business logic
- **Error states**: Test and handle error states

---

_This document should be regularly updated as our practices evolve._
