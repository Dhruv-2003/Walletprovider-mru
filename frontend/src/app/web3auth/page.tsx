"use client";
import Image from "next/image";
import {
  CHAIN_NAMESPACES,
  IProvider,
  UserInfo,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import { createWalletClient, custom, WalletClient } from "viem";
import { sepolia } from "viem/chains";

const clientId =
  "BCeKRAET4n5HiGCA12LxZ3BIrdBHfE3EilQKuufzR1fSveNo5Jldxx1mSkSFbZbY3jA-mn9Vb994Yx10FM_V2cQ"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

export default function Home() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
        console.log("Wallet init");

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    console.log("Logging in");
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
      await getUserInfo();
    }

    if (web3authProvider) {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(web3authProvider),
      });
      setWalletClient(walletClient);
      const address = await walletClient.getAddresses();
      setAddress(address[0]);
    }
  };

  const getUserInfo = async () => {
    const user = await web3auth.getUserInfo();
    console.log(user);
    if (user) {
      //@ts-ignore
      setUserInfo(user);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    console.log("Logged out");
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
        {loggedIn && userInfo ? (
          <div>
            <h1>{userInfo.email}</h1>

            <button
              onClick={logout}
              className="p-4 mt-4 bg-red-500 text-white rounded-lg"
            >
              Logout
            </button>
            <button
              onClick={() => sendAction()}
              className="p-4 bg-black text-white rounded-lg mx-4"
            >
              SendAction
            </button>
          </div>
        ) : (
          <button
            onClick={() => login()}
            className="p-4 bg-blue-500 text-white rounded-lg"
          >
            Login
          </button>
        )}
      </div>
    </main>
  );
}
