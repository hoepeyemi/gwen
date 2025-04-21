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

export function UpcomingBills() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base">Upcoming Bills</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Due in the next 30 days
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs sm:text-sm">View All</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium">NF</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Netflix</p>
                <p className="text-xs text-muted-foreground">May 23, 2023</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-medium text-xs sm:text-sm">$14.99</p>
              <Button size="sm" variant="outline" className="mt-1 text-xs h-6 sm:h-7 px-2 sm:px-3">
                Pay Now
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium">SP</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Spotify</p>
                <p className="text-xs text-muted-foreground">May 28, 2023</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-medium text-xs sm:text-sm">$9.99</p>
              <Button size="sm" variant="outline" className="mt-1 text-xs h-6 sm:h-7 px-2 sm:px-3">
                Pay Now
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium">AT</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">AT&T</p>
                <p className="text-xs text-muted-foreground">June 01, 2023</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-medium text-xs sm:text-sm">$79.99</p>
              <Button size="sm" variant="outline" className="mt-1 text-xs h-6 sm:h-7 px-2 sm:px-3">
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 