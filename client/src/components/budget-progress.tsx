import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Budget } from "@shared/schema";

export function BudgetProgress() {
  const { data: budgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets?.map((budget) => {
          const category = categories?.find(c => c.id === budget.categoryId);
          const progress = (Number(budget.spent) / Number(budget.amount)) * 100;
          
          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{category?.name}</span>
                <span>${budget.spent} / ${budget.amount}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
