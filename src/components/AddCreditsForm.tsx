import React, { useState } from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import Alert from './Alert';

interface AddCreditsFormProps {
  onSubmit: (amount: number, description?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'add' | 'subtract';
}

const AddCreditsForm: React.FC<AddCreditsFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'add',
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      const numAmount = parseFloat(amount);
      const finalAmount = mode === 'subtract' ? -Math.abs(numAmount) : Math.abs(numAmount);
      await onSubmit(finalAmount, description.trim() || undefined);
      setAmount('');
      setDescription('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update credits');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <Alert variant="error" title="Error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Input
        label={mode === 'add' ? 'Amount to Add' : 'Amount to Subtract'}
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        required
        placeholder="0.00"
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Add a note about this transaction..."
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant={mode === 'subtract' ? 'danger' : 'primary'}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : mode === 'add'
            ? 'Add Credits'
            : 'Subtract Credits'}
        </Button>
      </div>
    </form>
  );
};

export default AddCreditsForm;

