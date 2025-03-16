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
} from "recharts";
import { type Transaction } from "@shared/schema";
import { format } from "date-fns";

export function IncomeExpenses() {
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const data = transactions?.reduce((acc: any[], transaction) => {
    const date = format(new Date(transaction.date), "MMM yyyy");
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      if (transaction.type === "income") {
        existing.income += Number(transaction.amount);
      } else {
        existing.expenses += Number(transaction.amount);
      }
    } else {
      acc.push({
        date,
        income: transaction.type === "income" ? Number(transaction.amount) : 0,
        expenses: transaction.type === "expense" ? Number(transaction.amount) : 0,
      });
    }
    
    return acc;
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Income" />
              <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
