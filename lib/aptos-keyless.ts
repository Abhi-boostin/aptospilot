import { Aptos, AptosConfig, Network, EphemeralKeyPair, KeylessAccount } from "@aptos-labs/ts-sdk";
import { jwtDecode } from 'jwt-decode';

export interface KeylessAccountInfo {
  address: string;
  publicKey: string;
  balance: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Store the ephemeral key pair in localStorage
const storeEphemeralKeyPair = (ekp: EphemeralKeyPair): void => {
  localStorage.setItem("@aptos/ekp", encodeEphemeralKeyPair(ekp));
};

// Retrieve the ephemeral key pair from localStorage if it exists
const getLocalEphemeralKeyPair = (): EphemeralKeyPair | undefined => {
  try {
    const encodedEkp = localStorage.getItem("@aptos/ekp");
    return encodedEkp ? decodeEphemeralKeyPair(encodedEkp) : undefined;
  } catch (error) {
    console.warn("Failed to decode ephemeral key pair from localStorage", error);
    return undefined;
  }
};

// Stringify the ephemeral key pairs to be stored in localStorage
const encodeEphemeralKeyPair = (ekp: EphemeralKeyPair): string =>
  JSON.stringify(ekp, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return { __type: "EphemeralKeyPair", data: e.bcsToBytes() };
    return e;
  });

// Parse the ephemeral key pairs from a string
const decodeEphemeralKeyPair = (encodedEkp: string): EphemeralKeyPair =>
  JSON.parse(encodedEkp, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "EphemeralKeyPair")
      return EphemeralKeyPair.fromBytes(e.data);
    return e;
  });

// Store the KeylessAccount in localStorage
const storeKeylessAccount = (account: KeylessAccount): void => {
  localStorage.setItem("@aptos/account", encodeKeylessAccount(account));
};

// Retrieve the KeylessAccount from localStorage if it exists
const getLocalKeylessAccount = (): KeylessAccount | undefined => {
  try {
    const encodedAccount = localStorage.getItem("@aptos/account");
    return encodedAccount ? decodeKeylessAccount(encodedAccount) : undefined;
  } catch (error) {
    console.warn("Failed to decode account from localStorage", error);
    return undefined;
  }
};

// Stringify the KeylessAccount to be stored in localStorage
const encodeKeylessAccount = (account: KeylessAccount): string =>
  JSON.stringify(account, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof KeylessAccount)
      return { __type: "KeylessAccount", data: e.bcsToBytes() };
    return e;
  });

// Parse the KeylessAccount from a string
const decodeKeylessAccount = (encodedAccount: string): KeylessAccount =>
  JSON.parse(encodedAccount, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "KeylessAccount")
      return KeylessAccount.fromBytes(e.data);
    return e;
  });

// Parse JWT from URL fragment
const parseJWTFromURL = (url: string): string | null => {
  const urlObject = new URL(url);
  const fragment = urlObject.hash.substring(1);
  const params = new URLSearchParams(fragment);
  return params.get('id_token');
};

export class AptosKeylessManager {
  private aptos: Aptos;

  constructor() {
    const config = new AptosConfig({
      network: Network.MAINNET,
    });
    this.aptos = new Aptos(config);
  }

  /**
   * Start the keyless authentication flow
   * This follows the official Aptos Keyless integration guide
   */
  startKeylessFlow(): string {
    console.log("🚀 Starting keyless flow following official guide...");
    
    // 1. Create an ephemeral key pair
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    console.log("✅ Ephemeral key pair generated");
    
    // 2. Store the EphemeralKeyPair in local storage
    storeEphemeralKeyPair(ephemeralKeyPair);
    console.log("✅ Ephemeral key pair stored in localStorage");
    
    // 3. Prepare the URL params
    const redirectUri = `${window.location.origin}/auth/callback`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;
    const nonce = ephemeralKeyPair.nonce;
    
    console.log("📋 OIDC params:", { redirectUri, clientId, nonce: nonce.substring(0, 10) + "..." });
    
    // 4. Construct the login URL
    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${nonce}&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${clientId}`;
    
    console.log("🔗 Login URL created:", loginUrl);
    
    return loginUrl;
  }

  /**
   * Handle the OIDC callback and create keyless account
   * This follows the official Aptos Keyless integration guide
   */
  async handleCallback(): Promise<KeylessAccountInfo> {
    try {
      console.log("🔄 Handling OIDC callback...");
      console.log("📍 Current URL:", window.location.href);
      
      // 1. Extract JWT from URL
      const jwt = parseJWTFromURL(window.location.href);
      if (!jwt) {
        console.error("❌ No JWT found in URL");
        throw new Error("No JWT found in URL. Please try signing in again.");
      }
      
      console.log("✅ JWT extracted, length:", jwt.length);
      
      // 2. Decode JWT and extract nonce
      const payload = jwtDecode<{ nonce: string; email: string; name?: string; picture?: string }>(jwt);
      const jwtNonce = payload.nonce;
      const email = payload.email;
      const name = payload.name;
      const avatar = payload.picture;
      
      console.log("📋 JWT payload:", { nonce: jwtNonce.substring(0, 10) + "...", email, name });
      
      if (!jwtNonce) {
        throw new Error("No nonce found in JWT token");
      }
      
      if (!email) {
        throw new Error("No email found in JWT token");
      }
      
      // 3. Fetch and validate EphemeralKeyPair
      const ekp = getLocalEphemeralKeyPair();
      if (!ekp) {
        throw new Error("Ephemeral key pair not found. Please try signing in again.");
      }
      
      if (ekp.nonce !== jwtNonce) {
        console.error("❌ Nonce mismatch:", { jwtNonce: jwtNonce.substring(0, 10) + "...", ekpNonce: ekp.nonce.substring(0, 10) + "..." });
        throw new Error("Nonce mismatch. Please try signing in again.");
      }
      
      if (ekp.isExpired()) {
        throw new Error("Ephemeral key pair expired. Please try signing in again.");
      }
      
      console.log("✅ Ephemeral key pair validated");
      
      // 4. Derive KeylessAccount using official SDK
      console.log("🔐 Deriving keyless account...");
      const keylessAccount = await this.aptos.deriveKeylessAccount({
        jwt,
        ephemeralKeyPair: ekp,
      });
      
      console.log("✅ Keyless account derived successfully");
      
      // 5. Store the KeylessAccount in localStorage
      storeKeylessAccount(keylessAccount);
      console.log("✅ Keyless account stored in localStorage");
      
      // 6. Get account info
      const address = keylessAccount.accountAddress.toString();
      const publicKey = keylessAccount.publicKey.toString();
      
      console.log("📋 Account info:", { address, publicKey: publicKey.substring(0, 20) + "..." });
      
      // 7. Get balance
      const balance = await this.getAccountBalance(address);
      console.log("💰 Account balance:", balance);
      
      // 8. Store user info in localStorage
      if (email) {
        window.localStorage.setItem("aptos_user_email", email);
      }
      if (name) {
        window.localStorage.setItem("aptos_user_name", name);
      }
      if (avatar) {
        window.localStorage.setItem("aptos_user_avatar", avatar);
      }
      
      // 9. Clear ephemeral key pair (no longer needed)
      localStorage.removeItem("@aptos/ekp");
      
      return {
        address,
        publicKey,
        balance,
        email,
        name,
        avatar,
      };
    } catch (error) {
      console.error("🚨 Error handling keyless callback:", error);
      throw error;
    }
  }

  /**
   * Get existing keyless account from localStorage
   */
  getExistingKeylessAccount(): KeylessAccountInfo | null {
    try {
      console.log("🔍 Checking for existing keyless account...");
      const keylessAccount = getLocalKeylessAccount();
      
      if (!keylessAccount) {
        console.log("❌ No existing keyless account found");
        return null;
      }
      
      console.log("✅ Found existing keyless account");
      
      // Get user info from localStorage
      const email = window.localStorage.getItem("aptos_user_email") || "";
      const name = window.localStorage.getItem("aptos_user_name") || "";
      const avatar = window.localStorage.getItem("aptos_user_avatar") || "";
      
      return {
        address: keylessAccount.accountAddress.toString(),
        publicKey: keylessAccount.publicKey.toString(),
        balance: "0", // Will be updated when needed
        email,
        name,
        avatar,
      };
    } catch (error) {
      console.error("🚨 Error getting existing keyless account:", error);
      return null;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address: string): Promise<string> {
    try {
      const balance = await this.aptos.getAccountAPTAmount({
        accountAddress: address,
      });
      return balance.toString();
    } catch (error) {
      console.error("Error getting account balance:", error);
      return "0";
    }
  }

  /**
   * Check if account exists on chain
   */
  async accountExists(address: string): Promise<boolean> {
    try {
      await this.aptos.getAccountInfo({
        accountAddress: address,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign out and clear stored data
   */
  signOut(): void {
    console.log("🚪 Signing out and clearing data...");
    localStorage.removeItem("@aptos/ekp");
    localStorage.removeItem("@aptos/account");
    localStorage.removeItem("aptos_user_email");
    localStorage.removeItem("aptos_user_name");
    localStorage.removeItem("aptos_user_avatar");
    localStorage.removeItem("aptos_google_signed_in");
    console.log("✅ Sign out completed");
  }

  /**
   * Get the Aptos instance for transactions
   */
  getAptos(): Aptos {
    return this.aptos;
  }
} 