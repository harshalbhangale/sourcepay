# DevQuest Backend

Node.js + Express + TypeScript backend for DevQuest bounty platform.

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Blockchain**: Ethers.js for smart contract interaction
- **IPFS**: For metadata storage
- **Validation**: Zod

## Setup

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate with wallet signature
- `POST /api/auth/verify` - Verify JWT token

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id/assign` - Assign task (protected)

### Contributions

- `GET /api/contributions` - Get all contributions
- `GET /api/contributions/:id` - Get contribution by ID
- `POST /api/contributions` - Submit contribution (protected)
- `PUT /api/contributions/:id/score` - Score contribution (protected)

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Auth, validation, error handling
├── routes/         # API route definitions
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # App entry point
```
