import { MoreHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export function BalanceChart() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="text-sm sm:text-base">Balance</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Your balance across all accounts
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Tabs defaultValue="1m" className="w-auto">
              <TabsList className="h-7 sm:h-8 p-1">
                <TabsTrigger value="1w" className="text-xs h-5 sm:h-6 px-1.5 sm:px-2">1w</TabsTrigger>
                <TabsTrigger value="1m" className="text-xs h-5 sm:h-6 px-1.5 sm:px-2">1m</TabsTrigger>
                <TabsTrigger value="3m" className="text-xs h-5 sm:h-6 px-1.5 sm:px-2">3m</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs h-5 sm:h-6 px-1.5 sm:px-2">1y</TabsTrigger>
              </TabsList>
            </Tabs>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs sm:text-sm">Download as CSV</DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm">Download as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="h-[200px] sm:h-[240px] md:h-[300px]">
          {/* Placeholder for chart content */}
          <div className="flex items-center justify-center h-full w-full border rounded border-dashed">
            <p className="text-xs sm:text-sm text-muted-foreground">Chart Content</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-xs sm:text-sm">Checking</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs sm:text-sm">Savings</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs sm:text-sm">Investments</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs sm:text-sm h-7 sm:h-8">
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 