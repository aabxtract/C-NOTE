"use client";

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { History, Loader2, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { chainNoteConfig } from '@/lib/config';
import chainNoteAbi from '@/lib/contracts/chain-note-abi.json';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface NoteEvent {
  hash: string;
  sender: string;
  timestamp: number;
  blockNumber: bigint;
  transactionHash: string;
}

export function TransactionHistory() {
  const [history, setHistory] = useState<NoteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient({ chainId: chainNoteConfig.chain.id });

  useEffect(() => {
    async function fetchHistory() {
      if (!publicClient) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const logs = await publicClient.getLogs({
          address: chainNoteConfig.contractAddress,
          event: {
            type: 'event',
            name: 'NoteAdded',
            inputs: [
              { indexed: true, name: 'hash', type: 'bytes32' },
              { indexed: true, name: 'sender', type: 'address' },
              { indexed: false, name: 'timestamp', type: 'uint256' },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        const events = logs.map(log => ({
            hash: log.args.hash!,
            sender: log.args.sender!,
            timestamp: Number(log.args.timestamp!),
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
        })).reverse(); // Show most recent first

        setHistory(events);
      } catch (e: any) {
        console.error("Failed to fetch transaction history:", e);
        setError("Could not fetch transaction history. The network may be busy or the contract is not deployed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [publicClient]);
  
  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="text-accent" />
          Transaction History
        </CardTitle>
        <CardDescription>
          A log of the most recent notes timestamped on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading history...</span>
          </div>
        ) : error ? (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transaction history found.
          </div>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <TooltipProvider>
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((event) => (
                    <TableRow key={event.transactionHash}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <a 
                              href={`${chainNoteConfig.chain.blockExplorers.default.url}/tx/${event.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                                {truncateAddress(event.hash)}
                              </Badge>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{event.hash}</p>
                            <p className="text-muted-foreground">Click to view transaction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                           <TooltipTrigger asChild>
                            <code className="text-sm">{truncateAddress(event.sender)}</code>
                          </TooltipTrigger>
                          <TooltipContent>{event.sender}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp * 1000), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
