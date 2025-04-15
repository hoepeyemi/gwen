"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-center text-2xl font-bold">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500" />
          Druid
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-gray-600">
          Loading your account data...
        </p>
        <Progress value={progress} className="w-full" />
        <p className="text-center text-sm text-gray-500">
          {Math.round(progress)}% complete
        </p>
      </CardContent>
    </div>
  );
}
