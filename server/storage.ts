import { type Category, type Transaction, type Budget, 
         type InsertCategory, type InsertTransaction, type InsertBudget } from "@shared/schema";
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { type Category as CategoryType, type Transaction as TransactionType, type Budget as BudgetType,
         categories, transactions, budgets } from "@shared/schema";
import { eq } from 'drizzle-orm';
import WebSocket from 'ws';

// Configure neon to use WebSocket for better connection handling
neonConfig.webSocketConstructor = WebSocket;
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Categories
  getCategories(): Promise<CategoryType[]>;
  createCategory(category: InsertCategory): Promise<CategoryType>;

  // Transactions
  getTransactions(): Promise<TransactionType[]>;
  createTransaction(transaction: InsertTransaction): Promise<TransactionType>;

  // Budgets
  getBudgets(): Promise<BudgetType[]>;
  createBudget(budget: InsertBudget): Promise<BudgetType>;
  updateBudget(id: number, spent: number): Promise<BudgetType>;
}

export class PostgresStorage implements IStorage {
  async getCategories(): Promise<CategoryType[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<CategoryType> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getTransactions(): Promise<TransactionType[]> {
    return await db.select().from(transactions);
  }

  async createTransaction(transaction: InsertTransaction): Promise<TransactionType> {
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

  async getBudgets(): Promise<BudgetType[]> {
    return await db.select().from(budgets);
  }

  async createBudget(budget: InsertBudget): Promise<BudgetType> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, spent: number): Promise<BudgetType> {
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