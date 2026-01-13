"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Feather } from 'lucide-react';

export default function Header() {
  return (
    <header className="p-4 border-b border-border/40">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Feather className="text-primary h-7 w-7" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            ChainNote
          </h1>
        </div>
        <ConnectButton />
      </nav>
    </header>
  );
}
