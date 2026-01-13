"use client";

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// It is recommended to get a project ID from WalletConnect Cloud.
const projectId = '0409a6396590637380903f08083a2169';

const config = getDefaultConfig({
  appName: 'ChainNote',
  projectId,
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: 'hsl(224, 64%, 32%)',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            }),
            darkMode: darkTheme({
              accentColor: 'hsl(224, 64%, 32%)',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            }),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
