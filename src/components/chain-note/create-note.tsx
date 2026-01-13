"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ethers } from 'ethers';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AlertCircle, FileSignature, Hash, Loader2, Send, CheckCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { chainNoteConfig } from '@/lib/config';
import chainNoteAbi from '@/lib/contracts/chain-note-abi.json';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty.'),
});

export function CreateNote() {
  const [hashedNote, setHashedNote] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const noteHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(values.note));
    setHashedNote(noteHash);

    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to save the hash on-chain.',
        variant: 'destructive',
      });
      return;
    }
    
    writeContract({
      address: chainNoteConfig.contractAddress as `0x${string}`,
      abi: chainNoteAbi,
      functionName: 'addNote',
      args: [noteHash],
    });
  }
  
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Success!",
        description: "Your note's hash has been permanently stored on the blockchain.",
      });
      form.reset();
      setHashedNote(null);
    }
    if (error) {
       toast({
        title: 'Transaction Failed',
        description: error.shortMessage || "Something went wrong.",
        variant: 'destructive',
      });
    }
  }, [isConfirmed, error, toast, form]);

  const isLoading = isPending || isConfirming;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="text-accent" />
          Create On-Chain Note
        </CardTitle>
        <CardDescription>
          Securely timestamp your content by storing its unique hash on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Your Privacy Matters</AlertTitle>
          <AlertDescription>
            The content of your note never leaves your browser. We only generate a cryptographic hash (a unique fingerprint) of your text and store that on the blockchain. This proves your content existed at a specific time without revealing the content itself.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste or type your text here..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !isConnected} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Awaiting confirmation...' : 'Processing transaction...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Hash & Store On-Chain
                </>
              )}
            </Button>
            {!isConnected && <p className="text-sm text-center text-destructive">Connect your wallet to enable storing.</p>}
          </form>
        </Form>
        
        {isConfirmed && (
          <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <AlertTitle className="text-green-800 dark:text-green-300">Transaction Confirmed!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your note's hash is now securely on the blockchain. View on{' '}
              <a href={`${chainNoteConfig.chain.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-800">
                block explorer
              </a>.
            </AlertDescription>
          </Alert>
        )}

        {hashedNote && !isConfirmed && (
          <div className="space-y-2 pt-4">
            <h3 className="font-semibold text-sm">Generated SHA-256 Hash:</h3>
            <div className="flex items-center gap-2 bg-muted p-3 rounded-md break-all">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="text-sm text-muted-foreground">{hashedNote}</code>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
