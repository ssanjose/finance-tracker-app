'use client';

import React, { useState } from 'react';
import { useParams } from "next/navigation";
import TransactionTable from '@/components/transaction/TransactionTable';
import TransactionDetails from '@/components/transaction/TransactionDetails';
import { useLiveQuery } from 'dexie-react-hooks';
import { AccountService } from '@/services/account.service';
import AccountMenu from '@/components/account/AccountMenu';
import { OpenTransactionButton } from '@/components/transaction/TransactionButtons';

const Page = () => {
  const [transactionId, setTransactionId] = useState<number>(-1);
  const accountId = parseInt(useParams<{ id: string }>().id);
  const account = useLiveQuery(() => AccountService.getAccount(accountId));

  return (
    <div className="min-h-screen p-0 gap-16 sm:p-10 sm:pt-2 font-[family-name:var(--font-geist-sans)]">
      <div className="flex relative top-0">
        <div className="md:w-3/4 w-full p-2 pt-2 sm:p-4 sm:pt-4">
          <div className="flex flex-start justify-between min-w-sm mb-2 px-2 sm:p-0 sm:pb-2 border-b">
            <div className="w-full flex justify-between items-center">
              <h1 className="scroll-m-20 mb-2 text-2xl font-semibold tracking-tight first:mt-0 mr-2">
                {account?.name}
                <span className="text-normal font-normal text-md ml-2">{account ? `(${account?.id})` : null}</span>
              </h1>
              <OpenTransactionButton accountId={accountId} />
            </div>
            <AccountMenu account={account} />
          </div>
          <TransactionTable id={accountId} setTransactionId={setTransactionId} />
          <div className="sticky min-h-24 bottom-0 margin-2 bg-white">
            test
          </div>
        </div>
        <div className="hidden md:block w-1/4 h-fit sticky pt-2 sm:pt-4 top-0">
          <TransactionDetails id={transactionId} className="p-2 sm:p-4 min-h-80 border rounded" />
        </div>
      </div>
    </div>
  );
}

export default Page;
