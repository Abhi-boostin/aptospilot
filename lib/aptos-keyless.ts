import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ACKeylessClient } from "@identity-connect/dapp-sdk";
import { NetworkName } from "@identity-connect/api";

export interface KeylessAccountInfo {
  address: string;
  publicKey: string;
  balance: string;
  email: string;
  name?: string;
  avatar?: string;
}

export class AptosKeylessManager {
  private aptos: Aptos;
  private keylessClient: ACKeylessClient;

  constructor() {
    const config = new AptosConfig({
      network: Network.MAINNET,
    });
    this.aptos = new Aptos(config);
    
    // Initialize Keyless Client
    this.keylessClient = new ACKeylessClient({
      dappName: "AptosPilot",
      dappImageURI: "https://aptospilot.com/logo.png", // Optional: your app logo
      defaultNetworkName: NetworkName.MAINNET,
    });
  }

  /**
   * Start the keyless authentication flow
   * This uses the modern Identity Connect SDK
   */
  async startKeylessFlow(): Promise<void> {
    try {
      console.log("Starting Keyless authentication flow...");
      
      // Connect to the keyless account
      const result = await this.keylessClient.connect();
      
      console.log("Connection result:", result);
      
      // The user will be redirected to the OIDC provider
      // The result will be handled in the callback
    } catch (error) {
      console.error("Error starting keyless flow:", error);
      throw error;
    }
  }

  /**
   * Handle the authentication callback and create keyless account
   * This uses the modern Identity Connect SDK
   */
  async handleCallback(): Promise<KeylessAccountInfo> {
    try {
      console.log("Handling Keyless callback...");
      console.log("Current URL:", window.location.href);
      
      // Check if connected
      const isConnected = await this.keylessClient.isConnected();
      
      if (!isConnected) {
        throw new Error("Not connected to keyless account");
      }

      console.log("Successfully connected to keyless account");

      // Get connected accounts
      const accounts = await this.keylessClient.getConnectedAccounts();
      
      if (!accounts.accounts || accounts.accounts.length === 0) {
        throw new Error("No connected accounts found");
      }

      const account = accounts.accounts[0];
      console.log("Connected account:", account);

      // Get account info
      const address = account.accountAddress;
      const publicKey = account.accountPublicKeyB64;
      
      console.log("Account address:", address);
      console.log("Public key:", publicKey);

      // Get balance
      const balance = await this.getAccountBalance(address);

      console.log("Account balance:", balance);

      // For now, we'll use placeholder user info
      // In a real implementation, you'd get this from the OIDC provider
      const email = window.localStorage.getItem("aptos_user_email") || "user@example.com";
      const name = window.localStorage.getItem("aptos_user_name") || "User";
      const avatar = window.localStorage.getItem("aptos_user_avatar") || "";

      return {
        address,
        publicKey,
        balance,
        email,
        name,
        avatar,
      };
    } catch (error) {
      console.error("Error handling keyless callback:", error);
      throw error;
    }
  }

  /**
   * Get existing keyless account
   */
  async getExistingKeylessAccount(): Promise<KeylessAccountInfo | null> {
    try {
      // Check if connected
      const isConnected = await this.keylessClient.isConnected();
      
      if (!isConnected) {
        return null;
      }

      // Get connected accounts
      const accounts = await this.keylessClient.getConnectedAccounts();
      
      if (!accounts.accounts || accounts.accounts.length === 0) {
        return null;
      }

      const account = accounts.accounts[0];

      // Get user info from localStorage
      const email = window.localStorage.getItem("aptos_user_email") || "";
      const name = window.localStorage.getItem("aptos_user_name") || "";
      const avatar = window.localStorage.getItem("aptos_user_avatar") || "";

      return {
        address: account.accountAddress,
        publicKey: account.accountPublicKeyB64,
        balance: "0", // Will be updated when needed
        email,
        name,
        avatar,
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
  async signOut(): Promise<void> {
    try {
      await this.keylessClient.disconnect();
      
      // Clear localStorage
      window.localStorage.removeItem("aptos_user_email");
      window.localStorage.removeItem("aptos_user_name");
      window.localStorage.removeItem("aptos_user_avatar");
      window.localStorage.removeItem("aptos_google_signed_in");
      
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /**
   * Get the Aptos instance for transactions
   */
  getAptos(): Aptos {
    return this.aptos;
  }

  /**
   * Get the Keyless Client instance
   */
  getKeylessClient(): ACKeylessClient {
    return this.keylessClient;
  }
} 