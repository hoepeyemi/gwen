import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function IncomeExpenses() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-sm sm:text-base">Income & Expenses</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:gap-4">
        <div className="flex items-center justify-between bg-muted/50 p-2 sm:p-3 rounded-md hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-full">
              <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">Income</p>
              <p className="text-xs text-muted-foreground">Apr 15, 2023</p>
            </div>
          </div>
          <p className="font-medium text-sm sm:text-base text-green-600">+$4,129.00</p>
        </div>
        
        <div className="flex items-center justify-between bg-muted/50 p-2 sm:p-3 rounded-md hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-red-500/20 p-1.5 sm:p-2 rounded-full">
              <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">Expenses</p>
              <p className="text-xs text-muted-foreground">Apr 13, 2023</p>
            </div>
          </div>
          <p className="font-medium text-sm sm:text-base text-red-600">-$2,940.00</p>
        </div>
        
        <div className="flex items-center justify-between bg-muted/50 p-2 sm:p-3 rounded-md hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-full">
              <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">Income</p>
              <p className="text-xs text-muted-foreground">Apr 7, 2023</p>
            </div>
          </div>
          <p className="font-medium text-sm sm:text-base text-green-600">+$3,720.00</p>
        </div>
      </CardContent>
    </Card>
  );
} 