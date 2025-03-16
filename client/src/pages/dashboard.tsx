import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { TransactionList } from "@/components/transaction-list";
import { TransactionForm } from "@/components/transaction-form";
import { ExpenseBreakdown } from "@/components/charts/expense-breakdown";
import { IncomeExpenses } from "@/components/charts/income-expenses";
import { BudgetProgress } from "@/components/budget-progress";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type Transaction } from "@shared/schema";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

export default function Dashboard() {
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const stats = transactions?.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "income") {
        acc.income += amount;
      } else {
        acc.expenses += amount;
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, balance: 0 }
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <TransactionForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={`$${stats?.balance.toFixed(2) || "0.00"}`}
          icon={Wallet}
        />
        <StatsCard
          title="Income"
          value={`$${stats?.income.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Expenses"
          value={`$${stats?.expenses.toFixed(2) || "0.00"}`}
          icon={TrendingDown}
        />
        <StatsCard
          title="Savings"
          value={`${((stats?.balance || 0) / (stats?.income || 1) * 100).toFixed(1)}%`}
          icon={PiggyBank}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <IncomeExpenses />
        <ExpenseBreakdown />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionList />
        </div>
        <div>
          <BudgetProgress />
        </div>
      </div>
    </div>
  );
}
