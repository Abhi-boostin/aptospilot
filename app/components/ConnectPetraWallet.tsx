"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function ConnectPetraWallet() {
  const { connect, disconnect, account, connected, isLoading } = useWallet();

  if (isLoading) return <button disabled>Loading...</button>;

  return connected ? (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">Connected: {account?.address}</span>
      <button
        onClick={disconnect}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Disconnect
      </button>
    </div>
  ) : (
    <button
      onClick={() => connect("Petra")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Connect Petra Wallet
    </button>
  );
} 