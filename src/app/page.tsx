import Header from '@/components/layout/header';
import { CreateNote } from '@/components/chain-note/create-note';
import { VerifyNote } from '@/components/chain-note/verify-note';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionHistory } from '@/components/chain-note/transaction-history';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-neutral-950">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Tabs defaultValue="create" className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-3 bg-muted/60 dark:bg-neutral-800">
            <TabsTrigger value="create">Create Note</TabsTrigger>
            <TabsTrigger value="verify">Verify Note</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <CreateNote />
          </TabsContent>
          <TabsContent value="verify">
            <VerifyNote />
          </TabsContent>
          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
