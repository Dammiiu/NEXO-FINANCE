import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionsProps {
  transactions: Transaction[];
  theme?: 'dark' | 'light';
}

export const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  theme = 'dark',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'investment' | 'trade' | 'profit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.details && t.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.destinationAddress && t.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Transaction ID', 'Type', 'Amount', 'Coin', 'Status', 'Date', 'Address/Hash'];
    const rows = filtered.map((t) => [
      t.id,
      t.type,
      t.amount,
      t.coin,
      t.status,
      new Date(t.createdAt).toISOString(),
      t.destinationAddress || t.txHash || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nexo_Ledger_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-[#00FFB2] border border-emerald-500/30 dark:border-[#00FFB2]/20 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Immutable Cryptographic Audit Trail</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction History & Statements
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
            Complete real-time records of all deposits, withdrawals, yield payouts, and spot trades.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-gray-700 self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'investment', label: 'Staking' },
            { id: 'trade', label: 'Trades' },
            { id: 'profit', label: 'Yields' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#00FFB2] text-black shadow-md font-extrabold'
                  : 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, coin, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#00FFB2]"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div
        className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <History className="w-10 h-10 text-slate-500 dark:text-gray-500 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">No ledger records found matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-gray-500 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-gray-800 pb-3">
                <tr>
                  <th className="pb-3">Reference / Time</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Asset & Method</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ledger Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                {filtered.map((tx) => {
                  const isDeposit = tx.type === 'deposit' || tx.type === 'profit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/30 transition">
                      <td className="py-3.5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{tx.id}</div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === 'deposit'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : tx.type === 'withdrawal'
                              ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20'
                              : tx.type === 'investment'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : tx.type === 'profit'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-gray-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="font-extrabold text-slate-900 dark:text-white">{tx.coin}</div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400 capitalize">{tx.method || 'Internal ledger'}</div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`font-mono font-black text-sm ${
                            isDeposit ? 'text-emerald-600 dark:text-[#00FFB2]' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                          {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-mono text-[10px] text-slate-500 dark:text-gray-400">
                        {tx.destinationAddress ? (
                          <span className="truncate max-w-xs block ml-auto" title={tx.destinationAddress}>
                            {tx.destinationAddress}
                          </span>
                        ) : (
                          <span>NEXO-BLOCK-SYNC</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Transactions;
