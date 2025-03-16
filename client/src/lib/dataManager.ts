import { type Transaction, type Category, type Budget,
         type InsertTransaction, type InsertCategory, type InsertBudget } from "@shared/schema";
import { queryClient, apiRequest } from "./queryClient";

/**
 * DataManager class handles all data operations and persistence for the finance application.
 * It provides methods for CRUD operations, data filtering, and summary calculations.
 */
class DataManager {
  /**
   * Add a new transaction to the database
   * @param transaction The transaction data to add
   * @returns Promise<Transaction> The created transaction
   */
  async addTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const response = await apiRequest("POST", "/api/transactions", transaction);
    const newTransaction = await response.json();
    
    // Invalidate queries to refresh data
    await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    return newTransaction;
  }

  /**
   * Calculate financial summary from transactions
   * @param transactions Array of transactions to summarize
   * @returns Object containing totals and statistics
   */
  calculateSummary(transactions: Transaction[]) {
    return transactions.reduce(
      (summary, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === "income") {
          summary.income += amount;
        } else {
          summary.expenses += amount;
        }
        summary.balance = summary.income - summary.expenses;
        return summary;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  }

  /**
   * Filter transactions by date range and category
   * @param transactions Array of transactions to filter
   * @param filters Object containing filter criteria
   * @returns Filtered array of transactions
   */
  filterTransactions(
    transactions: Transaction[],
    filters: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: number;
    }
  ): Transaction[] {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      
      // Apply date range filter
      if (filters.startDate && transactionDate < filters.startDate) return false;
      if (filters.endDate && transactionDate > filters.endDate) return false;
      
      // Apply category filter
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false;
      
      return true;
    });
  }

  /**
   * Get expense breakdown by category
   * @param transactions Array of transactions to analyze
   * @param categories Array of categories for mapping
   * @returns Object with category totals and percentages
   */
  getExpenseBreakdown(transactions: Transaction[], categories: Category[]) {
    const breakdown = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc: Record<string, number>, transaction) => {
        const category = categories.find((c) => c.id === transaction.categoryId);
        const categoryName = category?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
        return acc;
      }, {});

    const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(breakdown).map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / total) * 100,
    }));
  }

  /**
   * Get monthly income vs expenses comparison
   * @param transactions Array of transactions to analyze
   * @returns Array of monthly comparisons
   */
  getMonthlyComparison(transactions: Transaction[]) {
    const monthlyData = transactions.reduce((acc: Record<string, { income: number; expenses: number }>, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }

      const amount = Number(transaction.amount);
      if (transaction.type === "income") {
        acc[monthKey].income += amount;
      } else {
        acc[monthKey].expenses += amount;
      }

      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

// Export a singleton instance
export const dataManager = new DataManager();