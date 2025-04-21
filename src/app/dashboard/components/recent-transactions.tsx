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
import { Avatar } from "~/components/ui/avatar";

export function RecentTransactions() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base">Recent Transactions</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Your recent transactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs sm:text-sm">View All</DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm">Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col divide-y">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 rounded-md">
                  <div className={`h-full w-full flex items-center justify-center text-lg`}
                      style={{
                        backgroundColor: getColorForTransaction(transaction.color, true),
                        color: getColorForTransaction(transaction.color)
                      }}
                  >
                    {transaction.icon}
                  </div>
                </Avatar>
                <div>
                  <div className="font-medium text-xs sm:text-sm">{transaction.name}</div>
                  <div className="text-xs text-muted-foreground">{transaction.date}</div>
                </div>
              </div>
              <div className={`text-xs sm:text-sm font-medium ${transaction.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-3 sm:p-4 border-t">
        <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm h-7 sm:h-8">
          View All Transactions
        </Button>
      </div>
    </Card>
  );
}

// Helper function to get appropriate colors for different transaction types
function getColorForTransaction(color: string, isBackground = false) {
  const colors: Record<string, { bg: string, text: string }> = {
    blue: { bg: '#e6f2ff', text: '#0066cc' },
    green: { bg: '#e6f9e6', text: '#00802b' },
    yellow: { bg: '#fff9e6', text: '#cc8800' },
    red: { bg: '#ffe6e6', text: '#cc0000' },
  };
  
  return isBackground ? colors[color]?.bg || '#f0f0f0' : colors[color]?.text || '#333333';
}

const transactions = [
  {
    id: "1",
    name: "Grocery Store",
    date: "Today, 2:30 PM",
    amount: "-$25.50",
    icon: "🛒",
    color: "blue",
  },
  {
    id: "2",
    name: "Salary Deposit",
    date: "Yesterday",
    amount: "+$4,750.00",
    icon: "💰",
    color: "green",
  },
  {
    id: "3",
    name: "Electricity Bill",
    date: "Jul 24, 2023",
    amount: "-$85.25",
    icon: "⚡",
    color: "yellow",
  },
  {
    id: "4",
    name: "Netflix Subscription",
    date: "Jul 23, 2023",
    amount: "-$15.99",
    icon: "📺",
    color: "red",
  },
  {
    id: "5",
    name: "Tax Refund",
    date: "Jul 20, 2023",
    amount: "+$1,250.00",
    icon: "💵",
    color: "green",
  },
]; 