import React, { useState } from 'react';
import type { CreditTransaction } from '../types';
import Table from './Table';
import Badge from './Badge';
import Select from './Select';
import DateRangePicker from './DateRangePicker';
import EmptyState from './EmptyState';

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
  loading?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const getTypeVariant = (type: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (type === 'add') return 'success';
    if (type === 'subtract') return 'error';
    if (type === 'usage') return 'info';
    return 'default';
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (dateRange) {
      const txDate = new Date(tx.created_at).getTime();
      const start = new Date(dateRange.start).getTime();
      const end = new Date(dateRange.end).getTime();
      if (txDate < start || txDate > end) return false;
    }
    return true;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'add', label: 'Add' },
    { value: 'subtract', label: 'Subtract' },
    { value: 'usage', label: 'Usage' },
  ];

  const columns = [
    {
      key: 'created_at',
      label: 'DATE',
      sortable: false,
      defaultWidth: 180,
      minWidth: 150,
      render: (tx: CreditTransaction) => (
        <span className="text-gray-600 text-sm whitespace-nowrap">
          {formatDate(tx.created_at)}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'TYPE',
      sortable: false,
      defaultWidth: 120,
      minWidth: 100,
      render: (tx: CreditTransaction) => (
        <Badge variant={getTypeVariant(tx.type)}>
          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'AMOUNT',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (tx: CreditTransaction) => (
        <span
          className={`font-medium ${
            tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      sortable: false,
      defaultWidth: 250,
      minWidth: 200,
      render: (tx: CreditTransaction) => (
        <span className="text-gray-600 text-sm">
          {tx.description || '-'}
        </span>
      ),
    },
    {
      key: 'job_id',
      label: 'JOB ID',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (tx: CreditTransaction) =>
        tx.job_id ? (
          <a
            href={`/jobs/${tx.job_id}`}
            className="text-blue-600 hover:text-blue-800 underline text-sm font-mono"
          >
            {tx.job_id}
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">Loading transactions...</div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter by Type"
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <DateRangePicker
            label="Date Range"
            startDate={dateRange?.start}
            endDate={dateRange?.end}
            onStartDateChange={(start: string) => setDateRange(start && dateRange?.end ? { start, end: dateRange.end } : start ? { start, end: start } : null)}
            onEndDateChange={(end: string) => setDateRange(dateRange?.start && end ? { start: dateRange.start, end } : null)}
          />
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table columns={columns} data={filteredTransactions} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

