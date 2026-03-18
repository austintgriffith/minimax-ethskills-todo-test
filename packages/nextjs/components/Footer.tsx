import React from "react";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import Link from "next/link";

/**
 * Site footer — minimal, no branding
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="fixed bottom-0 left-0 z-10 flex w-full items-center justify-between bg-base-100 p-4">
      <div className="flex gap-2">
        {isLocalNetwork && (
          <>
            <Faucet />
            <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Block Explorer</span>
            </Link>
          </>
        )}
      </div>
      <SwitchTheme />
    </div>
  );
};
