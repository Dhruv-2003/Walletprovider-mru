"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "1d584fa3-27d6-4c00-b4bd-3833f96202a2",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <PrivyProvider
        appId="clzsalvzh00itbbodonsmifqs"
        config={{
          // Customize Privy's appearance in your app
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            logo: "https://ethglobal.b-cdn.net/organizations/xgq6i/square-logo/default.png",
          },
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {children}
      </PrivyProvider>
    </DynamicContextProvider>
  );
}
