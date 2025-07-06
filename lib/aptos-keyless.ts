import { Aptos, AptosConfig, Network, EphemeralKeyPair, KeylessAccount } from "@aptos-labs/ts-sdk";
import { jwtDecode } from 'jwt-decode';
import { storeEphemeralKeyPair, getLocalEphemeralKeyPair, clearEphemeralKeyPair } from './ephemeral';
import { storeKeylessAccount, getLocalKeylessAccount, clearKeylessAccount, parseJWTFromURL } from './keyless';

export interface KeylessAccountInfo {
  address: string;
  publicKey: string;
  balance: string;
  email: string;
}

export class AptosKeylessManager {
  private aptos: Aptos;

  constructor() {
    const config = new AptosConfig({
      network: Network.MAINNET,
    });
    this.aptos = new Aptos(config);
  }

  /**
   * Generate ephemeral key pair and start the OIDC flow
   * This follows the official Aptos Keyless integration guide
   */
  startKeylessFlow(): string {
    // 1. Generate ephemeral key pair
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    
    // 2. Store in localStorage
    storeEphemeralKeyPair(ephemeralKeyPair);
    
    // 3. Prepare OIDC login URL with nonce
    const redirectUri = `${window.location.origin}/auth/callback`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!;
    const nonce = ephemeralKeyPair.nonce;
    
    // 4. Construct Google OIDC login URL
    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${nonce}&redirect_uri=${redirectUri}&client_id=${clientId}`;
    
    return loginUrl;
  }

  /**
   * Handle the OIDC callback and create keyless account
   * This follows the official Aptos Keyless integration guide
   */
  async handleCallback(): Promise<KeylessAccountInfo> {
    try {
      // 1. Parse JWT from URL fragment
      const jwt = parseJWTFromURL(window.location.href);
      if (!jwt) {
        throw new Error("No JWT found in URL");
      }

      // 2. Decode JWT and extract nonce
      const payload = jwtDecode<{ nonce: string; email: string }>(jwt);
      const jwtNonce = payload.nonce;
      const email = payload.email;

      // 3. Retrieve and validate ephemeral key pair
      const ekp = getLocalEphemeralKeyPair();
      if (!ekp || ekp.nonce !== jwtNonce || ekp.isExpired()) {
        throw new Error("Ephemeral key pair not found or expired");
      }

      // 4. Derive keyless account using official SDK
      const keylessAccount = await this.aptos.deriveKeylessAccount({
        jwt,
        ephemeralKeyPair: ekp,
      });

      // 5. Store keyless account in localStorage
      storeKeylessAccount(keylessAccount);

      // 6. Clear ephemeral key pair (no longer needed)
      clearEphemeralKeyPair();

      // 7. Get account info
      const address = keylessAccount.accountAddress.toString();
      const publicKey = keylessAccount.publicKey.toString();
      
      // 8. Get balance
      const balance = await this.getAccountBalance(address);

      return {
        address,
        publicKey,
        balance,
        email,
      };
    } catch (error) {
      console.error("Error handling keyless callback:", error);
      throw error;
    }
  }

  /**
   * Get existing keyless account from localStorage
   */
  getExistingKeylessAccount(): KeylessAccountInfo | null {
    try {
      const keylessAccount = getLocalKeylessAccount();
      if (!keylessAccount) {
        return null;
      }

      return {
        address: keylessAccount.accountAddress.toString(),
        publicKey: keylessAccount.publicKey.toString(),
        balance: "0", // Will be updated when needed
        email: "", // Not stored in account
      };
    } catch (error) {
      console.error("Error getting existing keyless account:", error);
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
    clearEphemeralKeyPair();
    clearKeylessAccount();
  }

  /**
   * Get the Aptos instance for transactions
   */
  getAptos(): Aptos {
    return this.aptos;
  }
} 