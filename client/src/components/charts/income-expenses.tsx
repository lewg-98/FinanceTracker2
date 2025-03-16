/**
 * IncomeExpenses Component
 * 
 * A bar chart visualization comparing income and expenses over time.
 * Uses Recharts for rendering and automatically updates when transaction data changes.
 * 
 * Features:
 * - Monthly comparison of income vs expenses
 * - Responsive design that adapts to container size
 * - Interactive tooltips with detailed information
 * - Custom color scheme for income/expense differentiation
 * - Loading and error states
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { type Transaction } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";

/**
 * Custom tooltip component for the bar chart
 */
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: {formatCurrency(entry.value as number)}</span>
          </p>
        ))}
        {payload.length === 2 && (
          <p className="mt-2 pt-2 border-t">
            Net: {formatCurrency((payload[0].value as number) - (payload[1].value as number))}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function IncomeExpenses() {
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Show loading state
  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-500">Error loading chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process and aggregate transaction data by month
  const data = transactions?.reduce((acc: any[], transaction) => {
    const date = format(parseISO(transaction.date), "MMM yyyy");
    const existing = acc.find(item => item.date === date);

    if (existing) {
      if (transaction.type === "income") {
        existing.income += Number(transaction.amount);
      } else {
        existing.expenses += Number(transaction.amount);
      }
      existing.net = existing.income - existing.expenses;
    } else {
      acc.push({
        date,
        income: transaction.type === "income" ? Number(transaction.amount) : 0,
        expenses: transaction.type === "expense" ? Number(transaction.amount) : 0,
        net: transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount),
      });
    }

    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="income"
                name="Income"
                fill="#4CAF50"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80"
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#FF6B6B"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}