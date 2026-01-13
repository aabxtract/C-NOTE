# **App Name**: ChainNote

## Core Features:

- Wallet Connection: Connect to the dApp using RainbowKit for easy wallet integration.
- Text Input and Hashing: Allow users to input text, and generate its cryptographic hash on the client-side using a secure hashing algorithm.
- On-Chain Hash Storage: Store the generated hash, sender's address, and timestamp on-chain using a Solidity smart contract and Ethers.js.
- Verification Page: Implement a verification tool page where users can input text and check if its hash already exists on-chain using a tool powered by Ethers.js and connection to the Smart Contract.
- Informational UI: Provide clear, beginner-friendly explanations about how ChainNote works, emphasizing that only the hash is stored on-chain, not the content itself.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A) for trust and security, aligning with blockchain aesthetics.
- Background color: Light gray (#F5F5F5) for a clean, unobtrusive backdrop.
- Accent color: Teal (#26A69A) to highlight interactive elements.
- Font: 'Inter', a grotesque-style sans-serif, for a clean, modern interface in both headlines and body text.
- Use simple, outline-style icons to represent blockchain concepts, wallet connections, and hashing processes.
- Maintain a minimalist layout with a clear focus on the text input and verification sections.
- Subtle animations when connecting to the wallet or confirming hash storage on the blockchain.