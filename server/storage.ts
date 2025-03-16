
import { type Category, type Transaction, type Budget, 
         type InsertCategory, type InsertTransaction, type InsertBudget } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { categories, transactions, budgets } from "@shared/schema";
import { eq } from 'drizzle-orm';

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, spent: number): Promise<Budget>;
}

export class PostgresStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();

    // Update budget if it exists
    if (transaction.type === "expense" && transaction.categoryId) {
      const existingBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.categoryId, transaction.categoryId));

      const currentBudget = existingBudgets[0];
      if (currentBudget) {
        await this.updateBudget(
          currentBudget.id,
          Number(currentBudget.spent) + Number(transaction.amount)
        );
      }
    }

    return newTransaction;
  }

  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, spent: number): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set({ spent: spent.toString() })
      .where(eq(budgets.id, id))
      .returning();

    if (!updatedBudget) {
      throw new Error("Budget not found");
    }

    return updatedBudget;
  }
}

export const storage = new PostgresStorage();
