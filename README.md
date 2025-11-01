# x402.chat

A decentralized social platform built with Next.js 16, where users can post and read comments on wallet addresses. Features web3 wallet authentication, ENS name resolution, real-time updates, and a beautiful UI powered by shadcn/ui and Tailwind CSS v4.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with server components
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, customizable UI components
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM for database operations
- **[PostgreSQL](https://www.postgresql.org/)** - Open source relational database (via Supabase, Neon, Railway, etc.)
- **[thirdweb](https://thirdweb.com/)** - Web3 SDK for wallet connection and ENS resolution
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Next.js Server Actions for mutations
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[pnpm](https://pnpm.io/)** - Efficient package manager

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (install via `npm install -g pnpm`)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd 402-chat
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration (PostgreSQL via Drizzle ORM)
# You can use Supabase, Neon, Railway, or any PostgreSQL provider
DATABASE_URL=postgresql://postgres:your-password@your-host:5432/your-database

# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
```

**Getting your credentials:**
- Database: Get a PostgreSQL connection string from [Supabase](https://supabase.com/), [Neon](https://neon.tech/), [Railway](https://railway.app/), or any PostgreSQL provider
- Thirdweb: Get your client ID from the [thirdweb dashboard](https://thirdweb.com/dashboard)

**Running migrations:**
```bash
# Generate migration files
pnpm drizzle-kit generate

# Apply migrations (already applied via Supabase MCP if you used the setup)
# Or manually run the SQL from drizzle/0000_*.sql against your database
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start the development server with hot-reload
- `pnpm build` - Create an optimized production build
- `pnpm start` - Start the production server
- `pnpm lint` - Run Biome linter to check code quality
- `pnpm fix` - Auto-fix linting and formatting issues

## Project Structure

```
402-chat/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Main page
│   │   └── globals.css        # Global styles and Tailwind configuration
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── wallet-connect.tsx # Wallet connection component
│   │   ├── comment-card.tsx   # Individual comment display
│   │   ├── comment-form.tsx   # Comment creation form
│   │   └── comment-list.tsx   # Comments list with real-time updates
│   ├── lib/                   # Utility functions and helpers
│   │   ├── queries/          # Data fetching functions
│   │   │   └── comments.ts   # Comment queries
│   │   ├── mutations/        # Data mutations
│   │   │   └── comments.ts   # Comment mutations
│   │   ├── thirdweb.ts       # Thirdweb client configuration
│   │   ├── ens.ts            # ENS resolution utilities
│   │   ├── providers.tsx     # React context providers
│   │   └── utils.ts          # Common utilities
│   └── db/                    # Database layer
│       ├── schema.ts         # Drizzle ORM schema
│       └── client.ts         # Database client
├── drizzle/                   # Database migrations
├── public/                    # Static assets
└── biome.json                # Biome linter configuration
```

## Features

### Core Features

- ✅ **Web3 Wallet Authentication** - Connect with any EVM-compatible wallet via thirdweb
- ✅ **ENS Name Resolution** - Automatically resolve and display ENS names for addresses
- ✅ **Comment System** - Post comments on any wallet address's page
- ✅ **Threaded Replies** - Reply to comments with nested threading
- ✅ **Like System** - Like/unlike comments with optimistic UI updates
- ✅ **Instant Updates** - Server Actions with automatic revalidation after mutations
- ✅ **Page Filtering** - View comments by specific wallet addresses
- ✅ **Pagination** - Efficient loading with "Load More" functionality
- ✅ **Dark Mode** - Full support for light and dark themes
- ✅ **Responsive Design** - Mobile-first responsive UI
- ✅ **Row Level Security** - Database-level security with Supabase RLS

### Technical Features

- ✅ React Server Components for optimal performance
- ✅ Server Actions for type-safe mutations
- ✅ Automatic revalidation with `revalidatePath()`
- ✅ Type-safe development with TypeScript and Drizzle ORM
- ✅ Optimistic UI updates for better UX
- ✅ Character limit enforcement (1000 characters)
- ✅ Indexed database queries for performance

## Development Guidelines

This project follows specific development patterns and best practices. For detailed guidelines on working with this codebase, especially for AI-assisted development, please refer to [AGENTS.md](./AGENTS.md).

### Key Principles

- **Server-first**: Prefer server components over client components
- **Type safety**: Always use TypeScript with proper types
- **Utility-first CSS**: Use Tailwind classes instead of custom CSS
- **Component reusability**: Use shadcn/ui components and extend them
- **Code quality**: Run `pnpm lint` and `pnpm fix` before committing

### Code Style

This project uses Biome for linting and formatting with the following configuration:

- **Indentation**: Spaces (2 spaces)
- **Quotes**: Double quotes
- **Import organization**: Auto-organized on save
- **CSS**: Tailwind directives enabled

## Configuration

### Tailwind CSS

The project uses Tailwind CSS v4 with a custom theme defined in `app/globals.css`. Theme colors support both light and dark modes and can be customized by modifying CSS variables in the `:root` and `.dark` selectors.

### Biome

Biome is configured to:

- Enable VCS integration with Git
- Support Tailwind CSS v4 directives (`@theme`, `@apply`, etc.)
- Format code with 2-space indentation
- Use double quotes for JavaScript/TypeScript
- Auto-organize imports

### shadcn/ui

Components are configured in `components.json` and can be added using:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Database Schema

This project uses **Drizzle ORM** exclusively for type-safe database operations with PostgreSQL.

### Comments Table

The `comments` table stores all page comments with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `owner_address` | text | Wallet address of the page owner (indexed) |
| `from_address` | text | Wallet address of the comment creator (indexed) |
| `text` | text | Comment content (max 1000 characters) |
| `parent_comment_id` | uuid | Reference to parent comment for threading |
| `likes_count` | integer | Number of likes (default 0) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

### Row Level Security (RLS)

The database implements RLS policies for security:

- **Read**: Anyone can read comments (public)
- **Insert**: Any user can insert comments
- **Update**: Users can update likes_count only

### Indexes

The following indexes are created for optimal query performance:

- `owner_address` - For filtering by page owner
- `from_address` - For filtering by comment creator
- `created_at` - For sorting by date

## How It Works

1. **Connect Wallet**: Users connect their EVM-compatible wallet using thirdweb
2. **View Pages**: By default, users see their own page. They can filter to view any address's page
3. **Post Comments**: Connected users can post comments on any wallet address's page using Server Actions
4. **Reply to Comments**: Users can reply to existing comments, creating threaded discussions
5. **Like Comments**: Users can like/unlike any comment with optimistic UI updates
6. **Instant Updates**: New comments and likes appear immediately via automatic revalidation
7. **ENS Resolution**: Wallet addresses are automatically resolved to ENS names when available

## Contributing

1. Create a new branch for your feature
2. Make your changes following the development guidelines
3. Run `pnpm lint` and `pnpm fix` to ensure code quality
4. Submit a pull request

## License

[Your License Here]

## Support

For questions or issues, please open an issue on GitHub.
