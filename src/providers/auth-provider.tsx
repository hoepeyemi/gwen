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

// Type guard to check if user has a wallet
function hasWallet(userContext: UserContextType): userContext is UserContextType & { 
  solana: { address: string; wallet: any } 
} {
  return userContext && 
    'solana' in userContext && 
    userContext.solana !== null && 
    typeof userContext.solana === 'object' &&
    'address' in userContext.solana;
}

// Type guard to check if user can create a wallet
function canCreateWallet(userContext: UserContextType): userContext is UserContextType & { 
  createWallet: () => Promise<void>;
  walletCreationInProgress: boolean;
} {
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

  // Get client ID from a client-safe source
  const civicClientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || ''
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
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("auth_user");
      }
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

  // Sync Civic Auth user with our local user state and handle Solana wallet
  const CivicUserSync = () => {
    const { user: userContext, isLoading: civicLoading } = useUser();
    const civicUser = userContext?.user;

    // Handle wallet creation for new users
    useEffect(() => {
      const createSolanaWallet = async () => {
        if (!civicLoading && civicUser && userContext && canCreateWallet(userContext)) {
          console.log("Creating Solana wallet for new user...");
          try {
            // Create a wallet if the user doesn't have one
            await userContext.createWallet();
            console.log("Solana wallet created successfully!");
            // Re-fetch user context after wallet creation
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error: unknown) {
            console.error("Failed to create Solana wallet:", error);
            toast.error("Failed to set up your wallet. Please try again.");
          }
        }
      };

      if (!civicLoading && civicUser && userContext && !hasWallet(userContext)) {
        createSolanaWallet();
      }
    }, [civicUser, civicLoading, userContext]);

    // Get Solana wallet address when available
    useEffect(() => {
      if (!civicLoading && userContext && hasWallet(userContext)) {
        const address = userContext.solana.address;
        console.log("Solana wallet address:", address);
        setSolanaWalletAddress(address);
      }
    }, [civicUser, civicLoading, userContext]);

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
          }
        } catch (error) {
          console.error("Error reading existing hashedPin:", error);
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
        };

        // Store in local storage
        localStorage.setItem("auth_user", JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsLoading(false);
      }
    }, [civicUser, civicLoading, solanaWalletAddress]);

    return null;
  };

  return (
    <CivicProvider clientId={civicClientId}>
      <UserContextProvider>
        <CivicUserSync />
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