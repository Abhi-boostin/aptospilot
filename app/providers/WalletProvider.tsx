"use client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider wallets={wallets} autoConnect={false}>
      {children}
    </AptosWalletAdapterProvider>
  );
} 