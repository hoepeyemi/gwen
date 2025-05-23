"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  CivicAuthProvider as CivicProvider, 
  useUser as useCivicUser,
  type UserContextType,
} from "@civic/auth-web3/react";
import toast from "react-hot-toast";
import { env } from "~/env";
import { api } from "~/trpc/server";

// Helper type guard to check if user has a Solana wallet
function userHasWallet(userContext: any): userContext is { 
  solana: { address: string; wallet: any } 
} {
  return userContext && 
    'solana' in userContext && 
    userContext.solana !== null && 
    typeof userContext.solana === 'object' &&
    'address' in userContext.solana;
}

// Helper to check if user can create a wallet
function canCreateWallet(userContext: any): boolean {
  return userContext && 
    'createWallet' in userContext && 
    typeof userContext.createWallet === 'function';
}

interface User {
  id: number;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  walletAddress?: string | null;
  name?: string | null;
  hashedPin?: string | null;
  picture?: string | null;
}

interface CivicUserContextState {
  user: UserContextType | null;
  isLoading: boolean;
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUserData: (userId: number) => Promise<User | null>;
  solanaWalletAddress?: string | null;
}

// Create a separate context for Web3 user data from Civic
const UserContext = createContext<CivicUserContextState>({
  user: null,
  isLoading: true,
  error: null
});

// Create context for our application's auth state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the Web3 user context
export function useUser() {
  return useContext(UserContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { user: userContext, isLoading: civicLoading } = useUser();
  const civicUser = userContext?.user;

  // Get client ID from a client-safe source
  const civicClientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || '8aa2352c-357e-45b9-8044-2e71bca664bf'
    : '';

  // Function to fetch the latest user data from server if needed
  const refreshUserData = async (userId: number) => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      
      // Format the URL based on tRPC client configuration
      const url = `/api/trpc/users.getUserById?batch=1&input=${encodeURIComponent(JSON.stringify({
        "0": { json: { userId } }
      }))}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-trpc-source': 'nextjs-react',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      // Format is a batch response array
      if (Array.isArray(json) && json[0]?.result?.data) {
        // The API might return data in a nested format with json property
        let userData = json[0].result.data;
        
        // If the user data has a nested json property, extract it
        if (userData.json && typeof userData.json === 'object') {
          userData = userData.json;
        }
        
        if (userData) {
          // Create a display name
          if (userData.firstName) {
            userData.name = userData.firstName + (userData.lastName ? ` ${userData.lastName}` : '');
          }
          
          // Store in local storage
          localStorage.setItem("auth_user", JSON.stringify(userData));
          
          // Update state
          setUser(userData);
          return userData;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    // Civic Auth handles this - this is just a placeholder for compatibility
    try {
      setIsLoading(true);
      console.log('Starting login process with Civic Auth');
      // The actual login is handled by Civic Auth component
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSolanaWalletAddress(null);
    localStorage.removeItem("auth_user");
    router.push("/auth/signin");
  };

  // Initialize state from localStorage on client
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // If we have a wallet address in stored user data, set it in state
        if (parsedUser.walletAddress) {
          setSolanaWalletAddress(parsedUser.walletAddress);
        }
        
        console.log("User loaded from localStorage:", parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("auth_user");
      }
    } else {
      console.log("No stored user found in localStorage");
    }
    setIsLoading(false);
  }, []);

  // Create a UserContextProvider component that uses the Civic useUser hook
  const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const civicUser = useCivicUser();
    
    return (
      <UserContext.Provider value={{
        user: civicUser,
        isLoading: civicUser.isLoading,
        error: civicUser.error || null
      }}>
        {children}
      </UserContext.Provider>
    );
  };

  // Component to handle Solana wallet creation and synchronization
  const SolanaWalletManager = () => {
    const { user: userContext, isLoading: civicLoading, error: civicError } = useUser();

    // Handle wallet creation and management
    useEffect(() => {
      const createAndSyncWallet = async () => {
        // Skip if still loading or no user
        if (civicLoading || !userContext || !userContext.user) {
          return;
        }

        try {
          // Cast userContext to any to handle the solana property which might not be in the type
          const context = userContext as any;
          
          console.log("⭐ Full Civic User Context:", JSON.stringify(context, null, 2));
          console.log("⭐ User Object:", JSON.stringify(context.user, null, 2));
            
          // Extract Solana wallet address if available
          let solanaAddress = null;
          
          if (context.solana && typeof context.solana === 'object' && 'address' in context.solana) {
            solanaAddress = context.solana.address;
            console.log("⭐ Solana wallet address from context.solana:", solanaAddress);
          } else if (context.user && context.user.solana && typeof context.user.solana === 'object' && 'address' in context.user.solana) {
            solanaAddress = context.user.solana.address;
            console.log("⭐ Solana wallet address from context.user.solana:", solanaAddress);
          }
          
          if (solanaAddress) {
            console.log("⭐ Using Civic wallet address:", solanaAddress);
            setSolanaWalletAddress(solanaAddress);
              
            // Update user data with wallet address if we have a user
            if (user) {
              const existingUserData = localStorage.getItem("auth_user") ? 
                JSON.parse(localStorage.getItem("auth_user") || "{}") : {};
              
              const updatedUser = { 
                ...user, 
                ...existingUserData,
                walletAddress: solanaAddress,
                // Make sure we capture the profile picture
                picture: context.user?.picture || existingUserData.picture
              };
              
              setUser(updatedUser);
              localStorage.setItem("auth_user", JSON.stringify(updatedUser));
              console.log("⭐ Updated user data with Civic wallet address:", updatedUser);
            }
          } else {
            console.log("⭐ No Civic wallet address found");
            
            // Check if we can create a wallet
            if (canCreateWallet(context)) {
              toast.loading("Setting up your Civic wallet...", { id: "wallet-creation" });
              
              // Create the wallet using the function we know exists
              await (context as any).createWallet();
              
              toast.success("Wallet created successfully!", { id: "wallet-creation" });
              console.log("⭐ Civic wallet created successfully!");
              
              // Reload to get updated context with the wallet
              window.location.reload();
            }
          }
        } catch (error) {
          console.error("Error managing Civic wallet:", error);
          toast.error("Failed to set up your wallet. Please try again.");
        }
      };

      createAndSyncWallet();
    }, [userContext?.user, civicLoading]);

    return null;
  };


  useEffect(() => {
    if (!civicLoading && civicUser) {
      // Try to preserve existing hashedPin from localStorage if it exists
      let existingHashedPin = null;
      let existingWalletAddress = solanaWalletAddress;

      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          existingHashedPin = userData.hashedPin || null;
          
          // If we don't have a wallet address yet, try to get it from storage
          if (!existingWalletAddress) {
            existingWalletAddress = userData.walletAddress || null;
          }
        }
      } catch (error) {
        console.error("Error reading existing user data:", error);
      }

      // Update our user state with Civic user data
      const userData: User = {
        id: parseInt(civicUser.id || '0'),
        email: civicUser.email || null,
        firstName: civicUser.name ? civicUser.name.split(' ')[0] : null,
        lastName: civicUser.name ? civicUser.name.split(' ').slice(1).join(' ') : null,
        name: civicUser.name || null,
        walletAddress: existingWalletAddress || null,
        hashedPin: existingHashedPin,
        picture: civicUser.picture || null,
      };

      // Store in local storage
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoading(false);
    }
  }, [civicUser, civicLoading, solanaWalletAddress]);

  return (
    <CivicProvider clientId={civicClientId}>
      <UserContextProvider>
        <SolanaWalletManager />
        <AuthContext.Provider value={{ 
          user, 
          isLoading, 
          login, 
          logout, 
          refreshUserData, 
          solanaWalletAddress 
        }}>
      {children}
    </AuthContext.Provider>
      </UserContextProvider>
    </CivicProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 