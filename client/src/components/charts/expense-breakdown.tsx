/**
 * ExpenseBreakdown Component
 * 
 * A donut chart visualization that breaks down expenses by category.
 * Uses Recharts for rendering and automatically updates when transaction data changes.
 * 
 * Features:
 * - Responsive design that adapts to container size
 * - Interactive tooltips showing category details
 * - Automatic color assignment for different categories
 * - Loading and error states
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { type Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

// Color palette for chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

/**
 * Custom tooltip component for the pie chart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-lg">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{formatCurrency(payload[0].value)}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].payload.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export function ExpenseBreakdown() {
  // Fetch transaction and category data
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Show loading state
  if (transactionsLoading || categoriesLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
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
  if (transactionsError || categoriesError) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-500">Error loading chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate expenses by category
  const expensesByCategory = transactions
    ?.filter(t => t.type === "expense")
    .reduce((acc: Record<string, number>, transaction) => {
      const category = categories?.find(c => c.id === transaction.categoryId);
      const categoryName = category?.name || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
      return acc;
    }, {});

  // Calculate total expenses for percentage calculations
  const totalExpenses = Object.values(expensesByCategory || {}).reduce((sum, amount) => sum + amount, 0);

  // Format data for the chart
  const data = Object.entries(expensesByCategory || {}).map(([name, value]) => ({
    name,
    value,
    percentage: (value / totalExpenses) * 100,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
              >
                {data.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}