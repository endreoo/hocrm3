import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService } from '../../services/api';
import type { Transaction } from '../../types';
import TransactionModal from '../../components/finance/TransactionModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

export default function Finance() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => financeService.getTransactions(page, { limit: pageSize }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Finance</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="py-4 text-center text-red-600">Error loading transactions</div>
      ) : transactionsData?.data.length === 0 ? (
        <div className="py-4 text-center text-gray-600">No transactions found</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transactionsData?.data.map(transaction => (
              <div
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="cursor-pointer rounded-lg border p-4 hover:border-indigo-600"
              >
                <h3 className="font-medium">{transaction.type}</h3>
                <p className="text-sm text-gray-600">
                  {transaction.currency} {transaction.amount}
                </p>
                <p className="mt-2 text-sm">
                  Status: <span className="font-medium">{transaction.status}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value) as PageSize)}
                className="rounded border p-1"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, transactionsData?.total || 0)} of{' '}
                <span className="font-medium">{transactionsData?.total || 0}</span> results
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (transactionsData?.pages || 1)}
                className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {selectedTransaction && (
            <TransactionModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
          )}
        </>
      )}
    </div>
  );
}