"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosKeylessManager } from "@/lib/aptos-keyless";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2, MessageSquare, Wallet, Key, Bot, LogOut, DollarSign, Send } from "lucide-react";
import AuthSection from "./AuthSection";
import WalletStatus from "./WalletStatus";
import WalletOptions from "./WalletOptions";
import AIChat from "./AIChat";
import NetworkSwitcher from "./NetworkSwitcher";
import ErrorDisplay from "./ErrorDisplay";
import SendAptModal from "./SendAptModal";
import axios from "axios";

const NETWORKS = [
  { label: "Mainnet", value: "mainnet", endpoint: "https://api.mainnet.aptoslabs.com/v1", sdk: Network.MAINNET },
  { label: "Testnet", value: "testnet", endpoint: "https://api.testnet.aptoslabs.com/v1", sdk: Network.TESTNET },
  { label: "Devnet", value: "devnet", endpoint: "https://api.devnet.aptoslabs.com/v1", sdk: Network.DEVNET },
];

interface KeylessAccountInfoType {
  address: string;
  publicKey: string;
  balance: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { account: petraAccount, connected: petraConnected, disconnect: disconnectPetra } = useWallet();
  const [network, setNetwork] = useState("mainnet");
  const [keylessAccount, setKeylessAccount] = useState<KeylessAccountInfoType | null>(null);
  const [walletType, setWalletType] = useState<"keyless" | "petra" | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [aptPrice, setAptPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSendAptModal, setShowSendAptModal] = useState(false);

  // Fetch APT price
  useEffect(() => {
    const fetchAptPrice = async () => {
      try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: { ids: 'aptos', vs_currencies: 'usd' },
          headers: { Accept: 'application/json' },
        });
        if (data.aptos && data.aptos.usd) {
          setAptPrice(data.aptos.usd);
        } else {
          console.warn('Invalid APT price data received:', data);
          setAptPrice(0);
        }
      } catch (error) {
        console.error('Failed to fetch APT price:', error);
        setAptPrice(0);
      }
    };

    fetchAptPrice();
    const interval = setInterval(fetchAptPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const signedIn = window.localStorage.getItem("aptos_google_signed_in");
    setIsSignedIn(!!signedIn);
  }, []);

  // Check for success parameter from callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true') {
      // Clear the success parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check for existing keyless account
      const checkExistingKeyless = async () => {
        try {
          const keylessManager = new AptosKeylessManager();
          const existingAccount = await keylessManager.getExistingKeylessAccount();
          if (existingAccount) {
            setKeylessAccount(existingAccount);
            setWalletType("keyless");
          }
        } catch (error) {
          console.error("Error checking existing keyless account:", error);
        }
      };
      
      checkExistingKeyless();
    }
  }, []);

  // Only create/check keyless account when user clicks the button
  const handleCreateKeyless = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🚀 Starting keyless account creation...");
      const keylessManager = new AptosKeylessManager();
      console.log("📱 Keyless manager created, starting flow...");
      const loginUrl = keylessManager.startKeylessFlow();
      console.log("✅ Keyless flow started successfully, redirecting to:", loginUrl);
      // Redirect to the OIDC provider
      window.location.href = loginUrl;
    } catch (err) {
      console.error("🚨 Error starting keyless flow:", err);
      setError(err instanceof Error ? err.message : "Failed to start keyless flow");
      setLoading(false);
    }
  };

  // Disconnect wallet function
  const handleDisconnectWallet = async () => {
    try {
      if (walletType === "keyless") {
        const keylessManager = new AptosKeylessManager();
        await keylessManager.signOut();
        setKeylessAccount(null);
      } else if (walletType === "petra") {
        await disconnectPetra();
      }
      setWalletType(null);
      setBalance("0");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const aptos = new Aptos(new AptosConfig({ network: NETWORKS.find(n => n.value === network)!.sdk }));
        let address = "";
        if (walletType === "keyless" && keylessAccount) {
          address = keylessAccount.address;
        } else if (walletType === "petra" && petraAccount?.address) {
          address = typeof petraAccount.address === "string"
            ? petraAccount.address
            : petraAccount.address.data
              ? Buffer.from(petraAccount.address.data).toString("hex")
              : petraAccount.address.toString();
        }
        if (address) {
          const bal = await aptos.getAccountAPTAmount({ accountAddress: address });
          setBalance(bal.toString());
        }
      } catch (err) {
        setBalance("0");
        setError("Failed to fetch balance");
      } finally {
        setLoading(false);
      }
    };
    if ((walletType === "keyless" && keylessAccount) || (walletType === "petra" && petraConnected && petraAccount)) {
      fetchBalance();
    }
  }, [network, walletType, keylessAccount, petraConnected, petraAccount]);

  useEffect(() => {
    if (petraConnected && petraAccount) {
      setWalletType("petra");
    }
  }, [petraConnected, petraAccount]);

  const handleSignOut = async () => {
    const keylessManager = new AptosKeylessManager();
    await keylessManager.signOut();
    window.localStorage.removeItem("aptos_google_signed_in");
    window.localStorage.removeItem("aptos_user_email");
    setIsSignedIn(false);
    setKeylessAccount(null);
    setWalletType(null);
    setBalance("0");
  };

  const getCurrentAddress = () => {
    if (walletType === "keyless" && keylessAccount) {
      return keylessAccount.address;
    } else if (walletType === "petra" && petraAccount?.address) {
      return typeof petraAccount.address === "string"
        ? petraAccount.address
        : petraAccount.address.data
          ? Buffer.from(petraAccount.address.data).toString("hex")
          : petraAccount.address.toString();
    }
    return "";
  };

  // Calculate USD balance
  const getUsdBalance = () => {
    const aptBalance = parseFloat(balance) / 100000000; // Convert from octas to APT
    return aptBalance * aptPrice;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading your Aptos dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AptosPilot</h1>
          <p className="text-gray-600">Your gateway to the Aptos blockchain</p>
        </div>

        {/* Authentication Section */}
        <AuthSection onSignOut={handleSignOut} />

        {/* Main Content */}
        {isSignedIn && (
          <div className="space-y-6">
            {/* Wallet Status - Show when wallet is connected */}
            {(walletType === "keyless" || walletType === "petra") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Wallet Status</h2>
                  <button
                    onClick={handleDisconnectWallet}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnect</span>
                  </button>
                </div>
                <WalletStatus
                  network={network}
                  balance={balance}
                  walletType={walletType}
                  address={getCurrentAddress()}
                  publicKey={keylessAccount?.publicKey}
                  aptPrice={aptPrice}
                  usdBalance={getUsdBalance()}
                />
              </div>
            )}

            {/* Network Switcher - Show when wallet is connected */}
            {(walletType === "keyless" || walletType === "petra") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <NetworkSwitcher network={network} setNetwork={setNetwork} networks={NETWORKS} />
              </div>
            )}

            {/* Wallet Options - Show when no wallet is connected */}
            {!walletType && (
              <div className="space-y-4">
                <WalletOptions onCreateKeyless={handleCreateKeyless} />
                
                {/* Test Keyless Account */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Test Keyless Account</h3>
                  <div className="space-y-3">
                    <button
                      onClick={async () => {
                        try {
                          console.log("🧪 Testing keyless account creation...");
                          const keylessManager = new AptosKeylessManager();
                          console.log("📱 Keyless manager:", keylessManager);
                          
                          // Test if we can create the manager
                          console.log("✅ Keyless manager created successfully");
                          
                          // Test if we can check existing accounts
                          const existing = keylessManager.getExistingKeylessAccount();
                          console.log("📋 Existing account check:", existing);
                          
                          // Test ephemeral key pair generation
                          console.log("🔑 Testing ephemeral key pair generation...");
                          const { EphemeralKeyPair } = await import("@aptos-labs/ts-sdk");
                          const testEkp = EphemeralKeyPair.generate();
                          console.log("✅ Ephemeral key pair generated:", testEkp.nonce.substring(0, 10) + "...");
                          
                          alert(`Keyless test completed! Check console for details.\nExisting account: ${existing ? 'Found' : 'Not found'}\nEphemeral key pair: Generated successfully`);
                        } catch (error) {
                          console.error("🚨 Keyless test error:", error);
                          alert(`Keyless test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Test Keyless Account
                    </button>
                    <p className="text-xs text-gray-500">
                      Click to test keyless account functionality and check console for detailed logs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chat Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Chat */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                </div>
                <AIChat />
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Wallet Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        walletType ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {walletType ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900 font-medium">
                        {walletType === "keyless" ? "Keyless Account" : 
                         walletType === "petra" ? "Petra Wallet" : "None"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Network:</span>
                      <span className="text-gray-900 font-medium capitalize">{network}</span>
                    </div>
                    {walletType && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">APT Balance:</span>
                          <span className="text-gray-900 font-medium">
                            {(parseFloat(balance) / 100000000).toFixed(4)} APT
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            USD Value:
                          </span>
                          <span className="text-gray-900 font-medium">
                            ${getUsdBalance().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">APT Price:</span>
                          <span className="text-gray-900 font-medium">
                            ${aptPrice.toFixed(2)}
                          </span>
                        </div>
                        {/* Send APT Button - Only show when wallet is connected */}
                        <div className="pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setShowSendAptModal(true)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Send APT
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Features Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Google OAuth Authentication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Aptos Keyless Accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Petra Wallet Integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Live Balance & Price Updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Multi-Network Support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send APT Modal */}
        <SendAptModal
          isOpen={showSendAptModal}
          onClose={() => setShowSendAptModal(false)}
          walletType={walletType}
          keylessAccount={keylessAccount}
          network={network}
          aptPrice={aptPrice}
        />
      </div>
    </div>
  );
} 