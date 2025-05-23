import { Buffer } from "buffer";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";
import {
  account,
  fundPubkey,
  fundSigner,
  native,
  server,
} from "~/lib/client-helpers";

// Type definitions for the passkey functionality
type SignerStoreType = 'Temporary' | 'Permanent';
const SignerStore = {
  Temporary: 'Temporary' as SignerStoreType,
  Permanent: 'Permanent' as SignerStoreType
};

export const usePasskey = (identifier: string) => {
  const [loading, setLoading] = useState(false);
  const setContractId = useContractStore((state) => state.setContractId);
  const setKeyId = useKeyStore((state) => state.setKeyId);

  const { keyId } = useKeyStore.getState();

  const saveSigner = api.transferData.saveSigner.useMutation({
    onError: (err) => console.error("Error in saveSigner:", err),
  });

  // Initialize tRPC mutation
  const { mutateAsync: sendTransaction, error } = api.transferData.send.useMutation({
    onError: (err) => console.error("Error in sendTransaction:", err),
  });

  // Create a function to handle the wallet creation process
  const create = async (): Promise<string> => {
    try {
      setLoading(true);
      
      if (!identifier) {
        throw new Error("Email or phone is required to create a passkey");
      }
      
      const user = "gwen";
      
      // Note the correct property destructuring
      const { keyId: kid, keyIdBase64, contractId: cid, signedTx } = 
        await account.createWallet(user, identifier);
      
      // Send the signed transaction using server.send() instead of account.send()
      const result = await server.send(signedTx);
      
      // Store the key ID and contract ID
      setKeyId(keyIdBase64);
      setContractId(cid);
      
      // Save signer info
      const isEmail = identifier.includes('@');
      await saveSigner.mutateAsync({
        contractId: cid,
        signerId: keyIdBase64,
        [isEmail ? 'email' : 'phone']: identifier,
      });
      
      toast.success("Successfully created passkey wallet");
        return cid;
    } catch (err) {
      toast.error((err as Error)?.message ?? "Failed to create passkey wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const connect = async (): Promise<string> => {
    try {
      setLoading(true);
      console.log('Attempting to connect wallet with passkey');
      
      const result = await account.connectWallet();
      console.log('ConnectWallet result:', result);
      
      const { keyIdBase64, contractId: cid } = result;

      if (!keyIdBase64 || !cid) {
        console.error('Missing keyIdBase64 or contractId from connectWallet result');
        throw new Error('Failed to retrieve wallet credentials');
      }

      console.log('Setting keyId and contractId:', { keyIdBase64, cid });
      setKeyId(keyIdBase64);
      setContractId(cid);

      toast.success(`Successfully connected with passkey`);
      return cid;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      
      // If the error occurs during biometric verification, provide specific guidance
      const errorMessage = (err as Error)?.message || '';
      if (errorMessage.includes('AbortError') || errorMessage.includes('user canceled')) {
        toast.error("Authentication was canceled. Please try again and complete the biometric verification.");
      } else if (errorMessage.includes('not supported')) {
        toast.error("Your browser doesn't support passkeys. Please use a supported browser like Chrome or Safari.");
      } else {
        toast.error(errorMessage || "Failed to connect with passkey");
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sign = async (xdr: string): Promise<string> => {
    const signedXDR = await account.sign(xdr, { keyId: String(keyId) });
    return signedXDR.toXDR();
  };

  const addSigner = async (name: string) => {
    try {
      const { keyId: kid, publicKey } = await account.createKey("gwen", name);
      
      // Create an admin transaction to add the signer
      const transaction = await account.addSecp256r1(
        kid, 
        publicKey, 
        undefined, 
        SignerStore.Temporary
      );
      
      // No need to sign the transaction in the mock implementation
      // Just send the built transaction directly
      const result = await server.send(transaction.built);
      return result;
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed to add signer");
      throw error;
    }
  };

  const getWalletSigners = async (contractId: string) => {
    try {
      const signers = await server.getSigners(contractId);
      return signers;
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed to get signers");
      throw error;
    }
  };

  const getWalletBalance = async (contractId: string) => {
    try {
      const { result } = await native.balance({ id: contractId });
      return result.toString();
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed to get balance");
      throw error;
    }
  };

  return { create, loading, error: null, sign, connect, addSigner, getWalletSigners, getWalletBalance };
};
