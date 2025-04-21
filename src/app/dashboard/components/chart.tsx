"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Jan",
    expenses: 4000,
    income: 2400,
  },
  {
    name: "Feb",
    expenses: 3000,
    income: 1398,
  },
  {
    name: "Mar",
    expenses: 2000,
    income: 9800,
  },
  {
    name: "Apr",
    expenses: 2780,
    income: 3908,
  },
  {
    name: "May",
    expenses: 1890,
    income: 4800,
  },
  {
    name: "Jun",
    expenses: 2390,
    income: 3800,
  },
  {
    name: "Jul",
    expenses: 3490,
    income: 4300,
  },
];

export function Chart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <Card className="col-span-4 border shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base">Financial Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your income and expenses for the last 7 months
            </CardDescription>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-1.5"></div>
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center ml-3">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-1.5"></div>
              <span className="text-xs text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: isMobile ? 5 : 20,
                left: isMobile ? -20 : 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={isMobile ? 5 : 10}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }} 
                tickFormatter={value => `$${value}`}
                width={isMobile ? 35 : 50}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, '']}
                contentStyle={{ 
                  fontSize: isMobile ? 10 : 12,
                  padding: isMobile ? '4px 8px' : '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
                labelStyle={{
                  fontWeight: 'bold',
                  marginBottom: isMobile ? 2 : 4
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: isMobile ? 2 : 3, fill: "#3b82f6" }}
                activeDot={{ r: isMobile ? 4 : 6 }}
                fillOpacity={1}
                fill="url(#colorIncome)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: isMobile ? 2 : 3, fill: "#ef4444" }}
                activeDot={{ r: isMobile ? 4 : 6 }}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 