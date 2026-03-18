"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Site header — minimal, onchain TodoList branding
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 z-20 flex w-full min-h-0 shrink-0 items-center justify-between bg-base-100 px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <Link href="/" passHref className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">onchain Todos</span>
            <span className="text-xs text-base-content/60">Base</span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
