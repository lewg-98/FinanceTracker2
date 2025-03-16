import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Budget, type Category } from "@shared/schema";

export function BudgetProgress() {
  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (budgetsLoading || categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-2 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <span>{category?.name || 'Unknown Category'}</span>
                <span className="text-muted-foreground">
                  £{Number(budget.spent).toFixed(2)} / £{Number(budget.amount).toFixed(2)}
                </span>
              </div>
              <Progress 
                value={progress} 
                className={`h-2 ${progress >= 100 ? 'bg-destructive' : ''}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}