"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Building, CreditCard, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAuth } from "~/providers/auth-provider";

export default function ConnectBankPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    router.push("/dashboard?bankConnected=true");
  };

  if (!user) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Connect Bank Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose Connection Method</CardTitle>
          <CardDescription>
            Select how you want to link your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="card">Card Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <Input 
                      id="bankName" 
                      placeholder="Enter your bank name" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    placeholder="Enter your account number" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input 
                    id="routingNumber" 
                    placeholder="Enter your routing number" 
                    required 
                  />
                </div>
                
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  <Lock className="mb-1 h-4 w-4" />
                  <p>Your bank details are secured with end-to-end encryption.</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Connecting..." : "Connect Bank Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <Input 
                      id="cardNumber" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input 
                      id="expiryDate" 
                      placeholder="MM/YY" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="XXX" 
                      required 
                      type="password" 
                      maxLength={4} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nameOnCard">Name on Card</Label>
                  <Input 
                    id="nameOnCard" 
                    placeholder="Full name as shown on card" 
                    required 
                  />
                </div>
                
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  <Lock className="mb-1 h-4 w-4" />
                  <p>Your card details are secured with PCI-compliant encryption.</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Connecting..." : "Connect Card"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 