import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { type Transaction, type Category } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface TransactionListProps {
  dateFilter?: string;
  categoryFilter?: string;
}

export function TransactionList({ dateFilter, categoryFilter }: TransactionListProps) {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Filter transactions based on date and category
  const filteredTransactions = transactions?.filter((transaction) => {
    let matches = true;

    // Apply date filter
    if (dateFilter) {
      const filterDate = startOfMonth(new Date(dateFilter + "-01"));
      const transactionDate = new Date(transaction.date);
      matches = matches && 
        isAfter(transactionDate, startOfMonth(filterDate)) &&
        isBefore(transactionDate, endOfMonth(filterDate));
    }

    // Apply category filter
    if (categoryFilter) {
      matches = matches && transaction.categoryId === parseInt(categoryFilter);
    }

    return matches;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTransactions?.map((transaction) => {
          const category = categories?.find(c => c.id === transaction.categoryId);
          return (
            <TableRow key={transaction.id}>
              <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{category?.name || "Uncategorized"}</TableCell>
              <TableCell className={transaction.type === "expense" ? "text-red-500" : "text-green-500"}>
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(Number(transaction.amount))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}