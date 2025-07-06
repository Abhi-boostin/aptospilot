"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AptosKeylessManager } from "@/lib/aptos-keyless";
import ConnectPetraWallet from "./ConnectPetraWallet";

interface KeylessAccountInfo {
  address: string;
  publicKey: string;
  balance: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keylessAccount, setKeylessAccount] = useState<KeylessAccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [showKeylessUI, setShowKeylessUI] = useState(false);

  // Only show options on first load
  useEffect(() => {
    setKeylessAccount(null);
    setShowKeylessUI(false);
    setError(null);
    setLoading(false);
  }, []);

  // Handler for creating keyless account
  const handleCreateKeyless = async () => {
    setLoading(true);
    setError(null);
    try {
      const keylessManager = new AptosKeylessManager();
      const accountInfo = await keylessManager.handleCallback();
      setKeylessAccount(accountInfo);
      setShowKeylessUI(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create keyless account");
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!keylessAccount) return;
    setRefreshingBalance(true);
    try {
      const keylessManager = new AptosKeylessManager();
      const balance = await keylessManager.getAccountBalance(keylessAccount.address);
      setKeylessAccount(prev => prev ? { ...prev, balance } : null);
    } catch (err) {
      console.error("Error refreshing balance:", err);
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleSignOut = () => {
    const keylessManager = new AptosKeylessManager();
    keylessManager.signOut();
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
            >
              Retry
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show options if no keyless account yet
  if (!showKeylessUI && !keylessAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to AptosPilot!</h2>
            <p className="text-gray-600 mb-6">Choose how you want to use the dApp:</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleCreateKeyless}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Keyless Account
              </button>
              <ConnectPetraWallet />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show keyless account info if created
  if (keylessAccount) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Aptos Keyless Account
                </h1>
                <p className="text-gray-600">This account is tied to your Google login and this dApp.</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Account Address
                  </h3>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {keylessAccount.address}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Balance
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(keylessAccount.balance) / 100000000} APT
                      </p>
                    </div>
                    <button
                      onClick={refreshBalance}
                      disabled={refreshingBalance}
                      className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                    >
                      {refreshingBalance ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Public Key
                </h3>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {keylessAccount.publicKey}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              About Keyless Accounts
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>No seed phrase or private key management required</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Account is permanently tied to your Google account and this dApp</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Recover access by simply signing in with the same Google account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each dApp creates a unique account for the same Google user</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Uses official Aptos Keyless SDK with EphemeralKeyPair for security</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
} 