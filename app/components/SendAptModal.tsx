"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";
import { X, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AptosKeylessManager } from "@/lib/aptos-keyless";

interface SendAptModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: "keyless" | "petra" | null;
  keylessAccount: any;
  network: string;
  aptPrice: number;
}

export default function SendAptModal({ 
  isOpen, 
  onClose, 
  walletType, 
  keylessAccount, 
  network,
  aptPrice
}: SendAptModalProps) {
  const { account: petraAccount, signAndSubmitTransaction, connected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"APT" | "USD">("APT");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const getCurrentAccount = () => {
    if (walletType === "keyless" && keylessAccount) {
      return keylessAccount;
    } else if (walletType === "petra" && petraAccount && connected) {
      return petraAccount;
    }
    return null;
  };

  const validateInputs = () => {
    if (!recipient.trim()) {
      setErrorMessage("Please enter a recipient address");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return false;
    }

    // Validate Aptos address
    try {
      AccountAddress.from(recipient);
    } catch {
      setErrorMessage("Please enter a valid Aptos address");
      return false;
    }

    // Wallet checks
    if (walletType === "petra") {
      if (!connected) {
        setErrorMessage("Petra wallet not connected. Please connect your wallet first.");
        return false;
      }
      if (!signAndSubmitTransaction) {
        setErrorMessage("Petra wallet not properly connected. Please reconnect your wallet.");
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const handleSendApt = async () => {
    if (!validateInputs()) return;

    const currentAccount = getCurrentAccount();
    if (!currentAccount) {
      setErrorMessage("No wallet connected");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      console.log("🚀 Starting APT transfer...");
      console.log("📱 Wallet type:", walletType);
      console.log("🌐 Network:", network);
      console.log("🔗 Wallet connected:", connected);
      console.log("📋 Petra account:", petraAccount);

      // Convert amount
      let aptAmount = parseFloat(amount);
      if (amountType === "USD") {
        aptAmount = parseFloat(amount) / aptPrice;
      }
      const amountInOctas = (aptAmount * 1e8).toString();

      if (!recipient || !amountInOctas || amountInOctas === "NaN") {
        throw new Error("Invalid recipient or amount");
      }

      const payload = {
        type: "entry_function_payload",
        function: "0x1::aptos_account::transfer",
        type_arguments: [],
        arguments: [recipient, amountInOctas],
      };

      console.log("📦 Transaction payload:", payload);

      let response;

      if (walletType === "petra") {
        console.log("🔐 Using Petra wallet for signing...");
        if (!signAndSubmitTransaction || typeof signAndSubmitTransaction !== "function") {
          throw new Error("Petra wallet signing function not available. Please reconnect your wallet.");
        }

        // ✅ FIX: wrap payload inside { data: payload }
        console.log("📦 Sending payload to Petra:", payload);
        response = await signAndSubmitTransaction({ data: payload });
        setTransactionHash(response.hash);
        console.log("✅ Petra transaction submitted:", response.hash);
      } else if (walletType === "keyless") {
        console.log("🔐 Using Keyless wallet for signing...");

        const keylessManager = new AptosKeylessManager();
        const aptos = new Aptos(new AptosConfig({ 
          network: network === "mainnet" ? Network.MAINNET : Network.TESTNET 
        }));

        const storedKeylessAccount = keylessManager.getExistingKeylessAccount();
        if (!storedKeylessAccount) {
          throw new Error("Keyless account not found. Please sign in again.");
        }

        const { getLocalKeylessAccount } = await import("@/lib/aptos-keyless");
        let keylessAccount = getLocalKeylessAccount();
        if (!keylessAccount) {
          throw new Error("Keyless account not found in storage. Please sign in again.");
        }

        const txn = await aptos.generateTransaction({
          sender: storedKeylessAccount.address,
          data: payload,
        });

        const signedTxn = await keylessAccount.sign(txn);
        response = await aptos.submitTransaction(signedTxn);
        setTransactionHash(response.hash);

        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log("✅ Keyless transaction confirmed:", response.hash);
      }

      setStatus("success");
      setTimeout(() => {
        setRecipient("");
        setAmount("");
        setStatus("idle");
        setTransactionHash("");
        onClose();
      }, 3000);

    } catch (error) {
      console.error("🚨 Send APT error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send APT");
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status === "sending") return;
    setRecipient("");
    setAmount("");
    setStatus("idle");
    setErrorMessage("");
    setTransactionHash("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Send APT</h2>
          <button
            onClick={handleClose}
            disabled={status === "sending"}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.00000001"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === "sending"}
              />
              <select
                value={amountType}
                onChange={(e) => setAmountType(e.target.value as "APT" | "USD")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === "sending"}
              >
                <option value="APT">APT</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Transaction successful!
                </p>
                {transactionHash && (
                  <p className="text-xs text-green-600 font-mono">
                    Hash: {transactionHash.substring(0, 10)}...
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleSendApt}
            disabled={status === "sending" || !recipient || !amount}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send APT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
