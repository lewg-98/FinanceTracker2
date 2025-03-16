import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertCategorySchema } from "@shared/schema";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      log(`Retrieved ${categories.length} categories`);
      res.json(categories);
    } catch (error: any) {
      log(`Error fetching categories: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const category = await storage.createCategory(result.data);
      log(`Created new category: ${category.name}`);
      res.json(category);
    } catch (error: any) {
      log(`Error creating category: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      log(`Retrieved ${transactions.length} transactions`);
      res.json(transactions);
    } catch (error: any) {
      log(`Error fetching transactions: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const transaction = await storage.createTransaction(result.data);
      log(`Created new transaction: ${transaction.description}`);
      res.json(transaction);
    } catch (error: any) {
      log(`Error creating transaction: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Budgets
  app.get("/api/budgets", async (_req, res) => {
    try {
      const budgets = await storage.getBudgets();
      log(`Retrieved ${budgets.length} budgets`);
      res.json(budgets);
    } catch (error: any) {
      log(`Error fetching budgets: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const result = insertBudgetSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      const budget = await storage.createBudget(result.data);
      log(`Created new budget for category ${budget.categoryId}`);
      res.json(budget);
    } catch (error: any) {
      log(`Error creating budget: ${error.message}`, "error");
      res.status(500).json({ error: "Failed to create budget" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}