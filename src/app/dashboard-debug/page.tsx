"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";

export default function DebugDashboard() {
  const [localStorage, setLocalStorage] = useState<Record<string, any>>({});
  const { user, isLoading } = useAuth();
  const { user: civicUserContext } = useUser();
  
  // Get all localStorage data
  useEffect(() => {
    const data: Record<string, any> = {};
    if (typeof window !== "undefined") {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          try {
            const value = window.localStorage.getItem(key);
            if (value) {
              try {
                data[key] = JSON.parse(value);
              } catch {
                data[key] = value;
              }
            }
          } catch (error) {
            console.error(`Error parsing localStorage key ${key}:`, error);
          }
        }
      }
      setLocalStorage(data);
    }
  }, []);
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard Debug Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>IsLoading:</strong> {isLoading ? "true" : "false"}
              </div>
              <div>
                <strong>User Object:</strong>
                <pre className="bg-gray-100 p-2 rounded overflow-auto mt-1 text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Civic User Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>IsLoading:</strong> {civicUserContext?.isLoading ? "true" : "false"}
              </div>
              <div>
                <strong>User Object:</strong>
                <pre className="bg-gray-100 p-2 rounded overflow-auto mt-1 text-xs">
                  {JSON.stringify(civicUserContext?.user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <strong>All localStorage Items:</strong>
              <pre className="bg-gray-100 p-2 rounded overflow-auto mt-1 text-xs h-60">
                {JSON.stringify(localStorage, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                // Refresh the page to check if data changes
                window.location.reload();
              }
            }}
          >
            Refresh Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                // Clear localStorage and refresh
                window.localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Clear LocalStorage
          </Button>
        </div>
      </div>
    </div>
  );
} 