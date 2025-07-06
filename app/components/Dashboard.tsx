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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const keylessManager = new AptosKeylessManager();
        
        // Check if user has an existing keyless account
        const existingAccount = keylessManager.getExistingKeylessAccount();
        
        if (existingAccount) {
          // Get fresh balance
          const balance = await keylessManager.getAccountBalance(existingAccount.address);
          setKeylessAccount({
            ...existingAccount,
            balance,
            email: "", // Email not stored in account
          });
        } else {
          // No existing account, redirect to sign in
          router.push("/auth/signin");
          return;
        }
      } catch (err) {
        console.error("Error initializing dashboard:", err);
        setError("Failed to load account information");
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

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
              Error Loading Account
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

  if (!keylessAccount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {searchParams.get('success') === 'true' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800">
                Your keyless account has been created successfully!
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to AptosPilot!
              </h1>
              <p className="text-gray-600">Your Aptos Keyless Account Dashboard</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
          <div className="mt-4">
            <ConnectPetraWallet />
          </div>
        </div>

        {/* Keyless Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Aptos Keyless Account
          </h2>
          
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

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800">
                  Your keyless account is ready! This account is permanently tied to your Google account and this dApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
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