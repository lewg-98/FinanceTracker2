import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { type Transaction, type Category } from "@shared/schema";
import { Download, MoreVertical, SortAsc, SortDesc } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SortField = "date" | "amount" | "description" | "type";
type SortOrder = "asc" | "desc";

export function TransactionList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (transactionsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    ?.filter((transaction) =>
      transaction.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (sortField === "amount") {
        return (Number(aValue) - Number(bValue)) * multiplier;
      }
      if (sortField === "date") {
        return (new Date(aValue).getTime() - new Date(bValue).getTime()) * multiplier;
      }
      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + 
      encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || "Unknown Category";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("date")} className="cursor-pointer">
              Date {sortField === "date" && (sortOrder === "asc" ? <SortAsc className="inline h-4 w-4" /> : <SortDesc className="inline h-4 w-4" />)}
            </TableHead>
            <TableHead onClick={() => toggleSort("description")} className="cursor-pointer">
              Description {sortField === "description" && (sortOrder === "asc" ? <SortAsc className="inline h-4 w-4" /> : <SortDesc className="inline h-4 w-4" />)}
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead onClick={() => toggleSort("amount")} className="cursor-pointer text-right">
              Amount {sortField === "amount" && (sortOrder === "asc" ? <SortAsc className="inline h-4 w-4" /> : <SortDesc className="inline h-4 w-4" />)}
            </TableHead>
            <TableHead className="w-[30px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(parseISO(transaction.date), "MMM d, yyyy")}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
              <TableCell className={transaction.type === "expense" ? "text-red-500" : "text-green-500 text-right"}>
                {transaction.type === "expense" ? "-" : "+"}£{Number(transaction.amount).toFixed(2)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}