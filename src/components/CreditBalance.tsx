import React from 'react';

interface CreditBalanceProps {
  balance: number;
  threshold?: number;
}

const CreditBalance: React.FC<CreditBalanceProps> = ({ balance, threshold = 100 }) => {
  const isLow = balance < threshold;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded border border-gray-200 p-6 ${isLow ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Current Balance
          </h3>
          <p className={`text-3xl font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(balance)}
          </p>
          {isLow && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Balance is below threshold ({formatCurrency(threshold)})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditBalance;

