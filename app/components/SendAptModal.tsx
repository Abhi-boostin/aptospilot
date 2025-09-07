"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";
import { X, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

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
  aptPrice,
}: SendAptModalProps) {
  const { account: petraAccount, signAndSubmitTransaction, connected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"APT" | "USD">("APT");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const validateInputs = () => {
    if (!recipient.trim()) {
      setErrorMessage("Please enter a recipient address");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return false;
    }
    try {
      AccountAddress.from(recipient);
    } catch {
      setErrorMessage("Please enter a valid Aptos address");
      return false;
    }
    if (walletType === "petra") {
      if (!connected || !petraAccount) {
        setErrorMessage("Petra wallet not connected. Please connect your wallet first.");
        return false;
      }
      if (!signAndSubmitTransaction) {
        setErrorMessage("Petra wallet not properly connected. Please reconnect your wallet.");
        return false;
      }
    }
    if (walletType === "keyless" && !keylessAccount) {
      setErrorMessage("Keyless account not available. Please authenticate first.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSendApt = async () => {
    if (!validateInputs()) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      let aptAmount = parseFloat(amount);
      if (amountType === "USD") {
        aptAmount = parseFloat(amount) / aptPrice;
      }

      const amountInOctas = Math.floor(aptAmount * 1e8);

      if (!recipient || isNaN(amountInOctas) || amountInOctas <= 0) {
        throw new Error("Invalid recipient or amount");
      }

      let responseHash: string;

      if (walletType === "petra") {
        if (!petraAccount || !signAndSubmitTransaction) {
          throw new Error("Petra account not connected");
        }

        // Correct format according to Aptos Connect docs
        const transaction = {
          data: {
            function: "0x1::aptos_account::transfer",
            typeArguments: [],
            functionArguments: [recipient, amountInOctas.toString()],
          },
        };

        const response = await signAndSubmitTransaction(transaction as any);
        responseHash = response.hash;

      } else if (walletType === "keyless") {
        if (!keylessAccount) {
          throw new Error("Keyless account not available");
        }

        const aptos = new Aptos(
          new AptosConfig({
            network: network === "mainnet" ? Network.MAINNET : Network.TESTNET,
          })
        );

        const transaction = await aptos.transaction.build.simple({
          sender: keylessAccount.accountAddress,
          data: {
            function: "0x1::aptos_account::transfer",
            typeArguments: [],
            functionArguments: [recipient, amountInOctas.toString()],
          },
        });

        const response = await aptos.signAndSubmitTransaction({
          signer: keylessAccount,
          transaction,
        });

        responseHash = response.hash;
      } else {
        throw new Error("Unsupported wallet type");
      }

      setTransactionHash(responseHash);
      setStatus("success");

      setTimeout(() => {
        setRecipient("");
        setAmount("");
        setStatus("idle");
        setTransactionHash("");
        onClose();
      }, 3000);

    } catch (err) {
      console.error("Send APT Error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to send APT");
      setStatus("error");
    }
  };

  // ... rest of your UI code remains the same
  const formatAmount = () => {
    if (!amount) return "";
    const numAmount = parseFloat(amount);
    if (amountType === "APT") {
      return `≈ $${(numAmount * aptPrice).toFixed(2)} USD`;
    } else {
      return `≈ ${(numAmount / aptPrice).toFixed(4)} APT`;
    }
  };

  const resetModal = () => {
    setRecipient("");
    setAmount("");
    setStatus("idle");
    setErrorMessage("");
    setTransactionHash("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Send APT</h2>
          <button onClick={resetModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Sending from</div>
            <div className="font-medium text-gray-900 capitalize">{walletType} Wallet</div>
            {walletType === "petra" && petraAccount && (
              <div className="text-xs text-gray-500 mt-1 font-mono">{petraAccount.address}</div>
            )}
            {walletType === "keyless" && keylessAccount && (
              <div className="text-xs text-gray-500 mt-1 font-mono">
                {keylessAccount.accountAddress?.toString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={status === "sending"}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.0001"
                min="0"
                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === "sending"}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <select
                  value={amountType}
                  onChange={(e) => setAmountType(e.target.value as "APT" | "USD")}
                  className="text-sm border-none bg-transparent focus:ring-0 focus:outline-none"
                  disabled={status === "sending"}
                >
                  <option value="APT">APT</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            {amount && <div className="text-xs text-gray-500">{formatAmount()}</div>}
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          {status === "success" && transactionHash && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700">Transaction sent successfully!</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Transaction Hash:</div>
                <div className="text-xs font-mono text-gray-800 break-all">{transactionHash}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleSendApt}
            disabled={status === "sending" || !recipient || !amount}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send APT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
