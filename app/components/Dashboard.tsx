"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosKeylessManager } from "@/lib/aptos-keyless";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2, MessageSquare, Wallet, Key, Bot } from "lucide-react";
import AuthSection from "./AuthSection";
import WalletStatus from "./WalletStatus";
import WalletOptions from "./WalletOptions";
import AIChat from "./AIChat";
import NetworkSwitcher from "./NetworkSwitcher";
import ErrorDisplay from "./ErrorDisplay";

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
  const { account: petraAccount, connected: petraConnected } = useWallet();
  const [network, setNetwork] = useState("mainnet");
  const [keylessAccount, setKeylessAccount] = useState<KeylessAccountInfoType | null>(null);
  const [walletType, setWalletType] = useState<"keyless" | "petra" | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const signedIn = window.localStorage.getItem("aptos_google_signed_in");
    setIsSignedIn(!!signedIn);
  }, []);

  const handleCreateKeyless = async () => {
    setLoading(true);
    setError(null);
    try {
      const keylessManager = new AptosKeylessManager();
      const accountInfo = await keylessManager.handleCallback();
      setKeylessAccount(accountInfo);
      setWalletType("keyless");
      // Store the real Google email in localStorage for session continuity
      if (accountInfo.email) {
        window.localStorage.setItem("aptos_user_email", accountInfo.email);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create keyless account");
    } finally {
      setLoading(false);
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

  const handleSignOut = () => {
    const keylessManager = new AptosKeylessManager();
    keylessManager.signOut();
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
              <WalletStatus
                network={network}
                balance={balance}
                walletType={walletType}
                address={getCurrentAddress()}
                publicKey={keylessAccount?.publicKey}
              />
            )}

            {/* Network Switcher - Show when wallet is connected */}
            {(walletType === "keyless" || walletType === "petra") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <NetworkSwitcher network={network} setNetwork={setNetwork} networks={NETWORKS} />
              </div>
            )}

            {/* Wallet Options - Show when no wallet is connected */}
            {!walletType && (
              <WalletOptions onCreateKeyless={handleCreateKeyless} />
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
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="text-gray-900 font-medium">
                          {(parseFloat(balance) / 100000000).toFixed(4)} APT
                        </span>
                      </div>
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
                      <span>Multi-Network Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>AI-Powered Assistant</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 