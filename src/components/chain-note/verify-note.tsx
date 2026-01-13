"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ethers } from 'ethers';
import { useReadContract } from 'wagmi';
import { AlertCircle, CheckCircle, FileSearch, Loader2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { chainNoteConfig } from '@/lib/config';
import chainNoteAbi from '@/lib/contracts/chain-note-abi.json';

const formSchema = z.object({
  note: z.string().min(1, 'Content to verify cannot be empty.'),
});

type NoteData = readonly [string, bigint] | undefined;

export function VerifyNote() {
  const [noteToVerify, setNoteToVerify] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: '' },
  });

  const { data: noteData, isLoading, refetch, isRefetching } = useReadContract({
    address: chainNoteConfig.contractAddress as `0x${string}`,
    abi: chainNoteAbi,
    functionName: 'notes',
    args: [noteToVerify],
    query: {
      enabled: false,
    }
  });
  
  useEffect(() => {
    if(noteToVerify) {
      refetch().then(() => {
        setShowResult(true);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteToVerify]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setShowResult(false);
    const noteHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(values.note));
    setNoteToVerify(noteHash);
  }

  const isVerifying = isLoading || isRefetching;
  const result = noteData as NoteData;
  const noteExists = result && result[0] !== '0x0000000000000000000000000000000000000000';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="text-accent" />
          Verify On-Chain Note
        </CardTitle>
        <CardDescription>
          Check if a piece of content has been previously timestamped on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>How Verification Works</AlertTitle>
          <AlertDescription>
            This tool generates the same unique hash from your text and checks if it exists in our smart contract. This process is secure and private.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content to Verify</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the exact text you want to verify..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 h-4 w-4" />
                  Verify Note
                </>
              )}
            </Button>
          </form>
        </Form>
        
        {showResult && !isVerifying && (
          noteExists ? (
             <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertTitle className="text-green-800 dark:text-green-300">Note Found!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400 space-y-1">
                <p>A hash for this content exists on the blockchain.</p>
                <p><strong>Sender:</strong> <code className="text-xs">{result[0]}</code></p>
                <p><strong>Timestamped:</strong> {formatDistanceToNow(new Date(Number(result[1]) * 1000), { addSuffix: true })}</p>
              </AlertDescription>
            </Alert>
          ) : (
             <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-500"/>
              <AlertTitle className="text-red-800 dark:text-red-300">Note Not Found</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                No record of this content's hash was found on the blockchain.
              </AlertDescription>
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
}
