"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";

export default function AuthTestPage() {
  const [localStorageData, setLocalStorageData] = useState<string>("");
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // Get all localStorage data as string
    if (typeof window !== "undefined") {
      try {
        const data: Record<string, any> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            const value = window.localStorage.getItem(key);
            if (value) {
              try {
                data[key] = JSON.parse(value);
              } catch {
                data[key] = value;
              }
            }
          }
        }
        setLocalStorageData(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error reading localStorage:", error);
        setLocalStorageData("Error reading localStorage");
      }
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Auth Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Auth Status</h2>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          <p>isLoading: {isLoading ? "true" : "false"}</p>
          <p>isAuthenticated: {user ? "true" : "false"}</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>User Data</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '200px' }}>
          {user ? JSON.stringify(user, null, 2) : "Not authenticated"}
        </pre>
      </div>
      
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>LocalStorage Data</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '300px' }}>
          {localStorageData || "No data"}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{ 
            padding: '8px 16px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onClick={() => window.location.href = "/auth/signin"}
        >
          Go to Sign In
        </button>
        
        <button 
          style={{ 
            padding: '8px 16px', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
        
        <button 
          style={{ 
            padding: '8px 16px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Clear LocalStorage
        </button>
      </div>
    </div>
  );
} 