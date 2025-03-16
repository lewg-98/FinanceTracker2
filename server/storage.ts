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
  deleteTransaction(id: number): Promise<void>;

  // Budgets
  getBudgets(): Promise<BudgetType[]>;
  createBudget(budget: InsertBudget): Promise<BudgetType>;
  updateBudget(id: number, spent: number): Promise<BudgetType>;
}

export class PostgresStorage implements IStorage {
  async getCategories(): Promise<CategoryType[]> {
    try {
      return await db.select().from(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  async createCategory(category: InsertCategory): Promise<CategoryType> {
    try {
      const [newCategory] = await db.insert(categories).values(category).returning();
      return newCategory;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  async getTransactions(): Promise<TransactionType[]> {
    try {
      return await db.select().from(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<TransactionType> {
    try {
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
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      const [deletedTransaction] = await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      // Update budget if it was an expense
      if (deletedTransaction && deletedTransaction.type === "expense" && deletedTransaction.categoryId) {
        const existingBudgets = await db
          .select()
          .from(budgets)
          .where(eq(budgets.categoryId, deletedTransaction.categoryId));

        const currentBudget = existingBudgets[0];
        if (currentBudget) {
          await this.updateBudget(
            currentBudget.id,
            Number(currentBudget.spent) - Number(deletedTransaction.amount)
          );
        }
      }
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      throw new Error("Failed to delete transaction");
    }
  }

  async getBudgets(): Promise<BudgetType[]> {
    try {
      return await db.select().from(budgets);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      throw new Error("Failed to fetch budgets");
    }
  }

  async createBudget(budget: InsertBudget): Promise<BudgetType> {
    try {
      const [newBudget] = await db.insert(budgets).values(budget).returning();
      return newBudget;
    } catch (error: any) {
      console.error("Error creating budget:", error);
      throw new Error("Failed to create budget");
    }
  }

  async updateBudget(id: number, spent: number): Promise<BudgetType> {
    try {
      const [updatedBudget] = await db
        .update(budgets)
        .set({ spent: spent.toString() })
        .where(eq(budgets.id, id))
        .returning();

      if (!updatedBudget) {
        throw new Error("Budget not found");
      }

      return updatedBudget;
    } catch (error: any) {
      console.error("Error updating budget:", error);
      throw new Error("Failed to update budget");
    }
  }
}

export const storage = new PostgresStorage();