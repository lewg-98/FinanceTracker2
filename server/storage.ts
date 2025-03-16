import { type Category, type Transaction, type Budget, 
         type InsertCategory, type InsertTransaction, type InsertBudget } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.currentIds = { categories: 1, transactions: 1, budgets: 1 };

    // Add default categories
    const defaultCategories = [
      { name: "Salary", type: "income" },
      { name: "Food", type: "expense" },
      { name: "Transport", type: "expense" },
      { name: "Utilities", type: "expense" },
      { name: "Entertainment", type: "expense" }
    ];

    defaultCategories.forEach(cat => {
      this.createCategory(cat);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const newTransaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);

    // Update budget if it exists
    if (transaction.type === "expense") {
      const budget = Array.from(this.budgets.values())
        .find(b => b.categoryId === transaction.categoryId);
      
      if (budget) {
        await this.updateBudget(budget.id, Number(budget.spent) + Number(transaction.amount));
      }
    }

    return newTransaction;
  }

  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.currentIds.budgets++;
    const newBudget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, spent: number): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) throw new Error("Budget not found");
    
    const updatedBudget = { ...budget, spent };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
}

export const storage = new MemStorage();
