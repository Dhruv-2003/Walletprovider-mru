"use client";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

import { useEffect, useState } from "react";
import { createWalletClient, custom, WalletClient } from "viem";
import { sepolia } from "viem/chains";

export default function Home() {
  const { primaryWallet } = useDynamicContext();

  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    if (primaryWallet && primaryWallet.address && primaryWallet.authenticated) {
      initWallet();
    }
  }, [primaryWallet]);

  const initWallet = async () => {
    try {
      const wallet = primaryWallet;

      const walletClient = await wallet?.connector.getWalletClient();

      if (walletClient) {
        setWalletClient(walletClient as WalletClient);

        const address = primaryWallet?.address;
        console.log(address);
        setAddress(address as `0x${string}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendAction = async () => {
    // 1. prepare action
    // 2. tx typeData
    // 3. sign actions
    // 4. send API call

    const actionName = "create";
    try {
      console.log("Sending action");
      const response = await fetch(
        `http://localhost:5050/getEIP712Types/${actionName}`
      );

      const data = await response.json();
      const eip712Types = data.eip712Types;
      console.log(eip712Types);

      const domain = data.domain;
      console.log(domain);

      if (!walletClient) {
        console.log("Wallet client not initialized");
        return;
      }

      if (!address) {
        return;
      }

      const payload = {
        address: address,
      };
      console.log(payload);

      const signature = await walletClient.signTypedData({
        account: address,
        domain: domain,
        primaryType: "createAccount",
        types: eip712Types,
        //@ts-ignore
        message: payload,
      });
      console.log("Signing action");

      console.log(`Signature for the create action for rollup : ${signature}`);

      const body = JSON.stringify({
        msgSender: address,
        signature,
        inputs: payload,
      });

      const res = await fetch(`http://localhost:5050/${actionName}`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Action sent");

      const json = await res.json();
      console.log(`Response: ${JSON.stringify(json, null, 2)}`);
      console.log(json);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="https://ethglobal.b-cdn.net/organizations/xgq6i/square-logo/default.png"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div> */}

      <div className="flex place-items-center ">
        {primaryWallet?.authenticated && (
          <div>
            <button
              onClick={() => sendAction()}
              className="p-4 bg-black text-white rounded-lg mx-4"
            >
              SendAction
            </button>
          </div>
        )}
        <DynamicWidget />
      </div>
    </main>
  );
}
