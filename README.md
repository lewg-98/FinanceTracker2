# Personal Finance Dashboard

A comprehensive personal finance management application designed to help users track, analyze, and optimize their financial health. Built with React, TypeScript, and PostgreSQL.

## Features

- 📊 Interactive dashboard with financial insights
  - Real-time transaction tracking
  - Income vs expenses visualization
  - Expense breakdown by category
  - Budget progress monitoring
- 💰 Transaction management
  - Add/delete transactions with date picker
  - Categorize transactions
  - Sort and filter transaction history
  - Export transactions as JSON
- 📅 Budget tracking
  - Set monthly budgets by category
  - Track spending progress
  - Automatic updates when transactions are added
- 📱 Responsive design for all devices

## Tech Stack

- Frontend:
  - React + TypeScript
  - TanStack Query for data fetching
  - Recharts for data visualization
  - shadcn/ui for components
  - React Hook Form + Zod for validation
- Backend:
  - Express.js
  - PostgreSQL with Drizzle ORM
  - WebSocket for real-time updates

## Environment Setup

Required environment variables in Replit Secrets:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## API Documentation

### Categories

- `GET /api/categories`
  - Returns all transaction categories
  - Response: `{ id: number, name: string, type: "income" | "expense" }`

- `POST /api/categories`
  - Creates a new category
  - Body: `{ name: string, type: "income" | "expense", description?: string }`

### Transactions

- `GET /api/transactions`
  - Returns all transactions
  - Response: `{ id: number, amount: number, description: string, date: string, categoryId: number, type: "income" | "expense" }`

- `POST /api/transactions`
  - Creates a new transaction
  - Body: `{ amount: number, description: string, date: string, categoryId: number, type: "income" | "expense" }`

- `DELETE /api/transactions/:id`
  - Deletes a transaction
  - Updates associated budget if it's an expense

### Budgets

- `GET /api/budgets`
  - Returns all budgets
  - Response: `{ id: number, categoryId: number, amount: number, spent: number, month: string }`

- `POST /api/budgets`
  - Creates a new budget
  - Body: `{ categoryId: number, amount: number, month: string }`

## Deployment on Replit

1. Fork this repl
2. Add required environment variables in Replit's Secrets tab
3. Click "Run" to start the application

The application will automatically:
- Install dependencies
- Set up the database schema
- Start the server on port 5000

## Development Guidelines

1. Code Organization
   - Frontend code in `client/src`
   - Backend routes in `server/routes.ts`
   - Database schema in `shared/schema.ts`
   - Storage interface in `server/storage.ts`

2. Adding Features
   - Update schema in `shared/schema.ts`
   - Add routes in `server/routes.ts`
   - Implement storage methods in `server/storage.ts`
   - Create frontend components in `client/src/components`

3. Database Changes
   - Add models to `shared/schema.ts`
   - Use `npm run db:push` to update the database

## Troubleshooting

1. Server Issues
   - Verify the server is running on port 5000
   - Check environment variables are set correctly
   - Review server logs for errors

2. Database Issues
   - Verify DATABASE_URL is correctly set
   - Check database connectivity
   - Review SQL logs for query errors

3. Frontend Issues
   - Clear browser cache
   - Check browser console for errors
   - Verify API endpoints are accessible

## License

MIT

## Database Schema
### Categories
```sql
- id: serial (Primary Key)
- name: text
- type: text (income/expense)
- description: text (optional)
```

### Transactions
```sql
- id: serial (Primary Key)
- amount: decimal
- description: text
- date: timestamp
- categoryId: integer (Foreign Key)
- type: text (income/expense)
```

### Budgets
```sql
- id: serial (Primary Key)
- categoryId: integer (Foreign Key)
- amount: decimal
- spent: decimal
- month: timestamp