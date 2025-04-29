import { env } from "~/env";

// Mock implementations to replace Stellar dependencies
export const generateMockId = () => {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `mock-${randomId}`;
};

export const generateMockAddress = () => {
  const randomAddress = Math.random().toString(36).substring(2, 15);
  return `addr-${randomAddress}`;
};

// Generate a mock public key for display purposes
export const generateMockPublicKey = () => {
  return `pub-${Math.random().toString(36).substring(2, 15)}`;
};

// Mock functions for funding accounts
export const fundPubkey = async (publicKey: string) => {
  console.log(`Mocking fund operation for public key: ${publicKey}`);
  return {
    success: true,
    transactionId: generateMockId()
  };
};

export const fundSigner = async (signerKey: string) => {
  console.log(`Mocking fund operation for signer key: ${signerKey}`);
  return {
    success: true,
    transactionId: generateMockId()
  };
};

// Mock class to replace PasskeyKit
export const mockPasskeyKit = {
  createPasskey: async (username: string) => {
    console.log(`Creating passkey for ${username}`);
    return generateMockId();
  },
  
  getPasskeys: async () => {
    return [{
      id: generateMockId(),
      name: "Mock Passkey",
      created: new Date().toISOString()
    }];
  },

  // Additional methods needed by usePasskey hook
  createWallet: async (user: string, identifier: string) => {
    console.log(`Creating wallet for ${user} with identifier ${identifier}`);
    const keyId = generateMockId();
    const contractId = generateMockId();
    return {
      keyId,
      keyIdBase64: Buffer.from(keyId).toString('base64'),
      contractId,
      signedTx: "mockedSignedTransaction"
    };
  },

  connectWallet: async () => {
    console.log("Connecting to wallet with passkey");
    const keyId = generateMockId();
    const contractId = generateMockId();
    return {
      keyIdBase64: Buffer.from(keyId).toString('base64'),
      contractId
    };
  },

  sign: async (xdr: string, options: { keyId: string }) => {
    console.log(`Signing transaction with key ${options.keyId}`);
    return {
      toXDR: () => "mockedSignedXDR"
    };
  },

  createKey: async (user: string, name: string) => {
    console.log(`Creating key for ${user} with name ${name}`);
    return {
      keyId: generateMockId(),
      publicKey: generateMockPublicKey()
    };
  },

  addSecp256r1: async (keyId: string, publicKey: string, limits?: any, store?: any) => {
    console.log(`Adding secp256r1 key ${keyId} with public key ${publicKey}`);
    return {
      built: "mockedTransaction"
    };
  }
};

// Exports to maintain API compatibility with existing code
export const account = mockPasskeyKit;

// Mock server object
export const server = {
  generateId: generateMockId,
  generateAddress: generateMockAddress,
  send: async (tx: string) => {
    console.log(`Sending transaction: ${tx}`);
    return {
      success: true,
      txId: generateMockId()
    };
  },
  getSigners: async (contractId: string) => {
    console.log(`Getting signers for contract ${contractId}`);
    return [
      {
        id: generateMockId(),
        name: "Mock Signer 1",
        type: "secp256r1",
        created: new Date().toISOString()
      }
    ];
  }
};

// Mock native client
export const native = {
  getBalance: async () => ({ balance: 1000 }),
  transfer: async () => ({ success: true, txId: generateMockId() }),
  balance: async ({ id }: { id: string }) => {
    console.log(`Getting balance for ${id}`);
    return {
      result: 1000
    };
  }
};