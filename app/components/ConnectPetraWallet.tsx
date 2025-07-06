"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

export default function ConnectPetraWallet() {
  const { connect, disconnect, account, connected, isLoading } = useWallet();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await connect("Petra");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  // Safely render the address as a string
  let addressString = "";
  if (account?.address) {
    if (typeof account.address === "string") {
      addressString = account.address;
    } else if (account.address.data) {
      // If address is { data: Uint8Array }
      try {
        addressString = Buffer.from(account.address.data).toString("hex");
      } catch {
        addressString = JSON.stringify(account.address.data);
      }
    } else if (account.address.toString) {
      addressString = account.address.toString();
    } else {
      addressString = JSON.stringify(account.address);
    }
  }

  if (isLoading) return <button disabled>Loading...</button>;

  return connected ? (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">Connected: {addressString}</span>
      <button
        onClick={disconnect}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Disconnect
      </button>
    </div>
  ) : (
    <div>
      <button
        onClick={handleConnect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Connect Petra Wallet
      </button>
      {localError && (
        <div className="text-red-600 text-xs mt-2">
          {localError}
        </div>
      )}
    </div>
  );
} 