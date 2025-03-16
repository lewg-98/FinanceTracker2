import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransactionList } from "@/components/transaction-list";
import { TransactionForm } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Category } from "@shared/schema";
import { dataManager } from "@/lib/dataManager";

export default function Transactions() {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="transition-all hover:scale-105">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px]">
            <SheetHeader>
              <SheetTitle>Add Transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <TransactionForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 items-end">
        <div className="w-full max-w-sm">
          <label className="text-sm font-medium mb-2 block">
            Date Filter
          </label>
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="w-full max-w-sm">
          <label className="text-sm font-medium mb-2 block">
            Category Filter
          </label>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <TransactionList
            dateFilter={dateFilter}
            categoryFilter={categoryFilter}
          />
        </div>
      </div>
    </div>
  );
}