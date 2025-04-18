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
  useWallet,
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
  publicKey?: string | null;
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
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { user: userContext, isLoading: civicLoading } = useUser();
  const civicUser = userContext?.user;

  // Get client ID from a client-safe source
  const civicClientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || '3fb12e4d-dde9-48d3-b510-62783dae555a'
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
    setPublicKey(null);
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

  // Component to handle Solana wallet creation and synchronization
  const SolanaWalletManager = () => {
    const { user: userContext, isLoading: civicLoading, error: civicError } = useUser();
    const wallet = useWallet({ type: "solana" });
    
    // Handle Civic errors, especially session mismatch errors
    useEffect(() => {
      if (civicError) {
        console.error("Civic Auth error:", civicError);
        
        // Check for session mismatch errors
        if (civicError.message && 
            (civicError.message.includes("session mismatch") || 
             civicError.message.includes("authentication session"))) {
          console.log("Detected session mismatch error, clearing local auth data");
          
          // Clear local storage auth data
          localStorage.removeItem("auth_user");
          
          // Clear state
          setUser(null);
          setSolanaWalletAddress(null);
          setPublicKey(null);
          
          // Show toast message
          toast.error("Authentication session expired. Please sign in again.");
          
          // Redirect to sign-in after a short delay
          setTimeout(() => {
            router.push("/auth/signin");
          }, 1500);
        }
      }
    }, [civicError, router]);

    // Get the publicKey from the wallet - this runs on every wallet change
    useEffect(() => {
      // Cast wallet to any to access publicKey
      const solanaWallet = wallet as any;
      if (solanaWallet && solanaWallet.publicKey) {
        const walletAddress = solanaWallet.publicKey.toString();
        console.log("Setting publicKey from wallet:", walletAddress);
        
        // Update both state values to ensure consistency
        setPublicKey(walletAddress);
        setSolanaWalletAddress(walletAddress);
        
        // Always update localStorage to ensure it's up-to-date
        const storedUser = localStorage.getItem("auth_user");
        let updatedUser;
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            updatedUser = { 
              ...userData, 
              walletAddress: walletAddress
            };
          } catch (error) {
            console.error("Error parsing stored user:", error);
            updatedUser = { 
              id: 0,
              walletAddress: walletAddress
            };
          }
        } else {
          // Create minimal user data if none exists
          updatedUser = { 
            id: 0,
            walletAddress: walletAddress
          };
        }
        
        // Update state and localStorage
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        
        // Debug - display user data after update
        console.log("Updated user data with wallet address:", updatedUser);
      }
    }, [wallet]);

    // Handle wallet creation and management
    useEffect(() => {
      const createAndSyncWallet = async () => {
        // Skip if still loading or no user
        if (civicLoading || !userContext || !userContext.user) {
          return;
        }

        try {
          // If we already have a public key from the wallet, use that
          // Cast wallet to any to access publicKey
          const solanaWallet = wallet as any;
          if (solanaWallet && solanaWallet.publicKey) {
            const walletAddress = solanaWallet.publicKey.toString();
            console.log("Wallet already connected:", walletAddress);
            setSolanaWalletAddress(walletAddress);
            setPublicKey(walletAddress);
            
            // Update our user with the wallet address
            if (user) {
              const updatedUser = {
                ...user,
                walletAddress: walletAddress
              };
              setUser(updatedUser);
              localStorage.setItem("auth_user", JSON.stringify(updatedUser));
            } else {
              // If we don't have a user yet but do have a wallet, create a minimal user
              const minimalUser = {
                id: 0,
                walletAddress: walletAddress
              };
              setUser(minimalUser);
              localStorage.setItem("auth_user", JSON.stringify(minimalUser));
            }
            return;
          }
          
          // Cast userContext to any to handle the solana property which might not be in the type
          const context = userContext as any;
          
          // Check if user has a wallet using our helper function
          if (!userHasWallet(context)) {
            console.log("No wallet found. Creating a Solana wallet for user...");
            
            // The user doesn't have a wallet yet, so we need to create one
            if (canCreateWallet(context)) {
              toast.loading("Setting up your Solana wallet...", { id: "wallet-creation" });
              
              // Create the wallet using the function we know exists (thanks to our type guard)
              await (context as any).createWallet();
              
              toast.success("Wallet created successfully!", { id: "wallet-creation" });
              console.log("Solana wallet created successfully!");
              
              // Reload to get updated context with the wallet
              window.location.reload();
            } else {
              console.error("createWallet function not available on user context");
            }
          } else {
            // User already has a wallet, extract and store the address
            console.log("Existing wallet found:", context.solana.address);
            setSolanaWalletAddress(context.solana.address);
              
            // Update user data with wallet address if we have a user
            if (user) {
              const updatedUser = { 
                ...user, 
                walletAddress: context.solana.address 
              };
              
              setUser(updatedUser);
              localStorage.setItem("auth_user", JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error("Error managing Solana wallet:", error);
          toast.error("Failed to set up your wallet. Please try again.");
        }
      };

      createAndSyncWallet();
    }, [userContext?.user, civicLoading, wallet]);

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
        walletAddress: publicKey || existingWalletAddress || null,
        hashedPin: existingHashedPin,
      };

      // Store in local storage
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoading(false);
    }
  }, [civicUser, civicLoading, solanaWalletAddress, publicKey]);

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
          solanaWalletAddress,
          publicKey
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