import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const confirmVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary';

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="ghost" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button variant={confirmVariant} onClick={handleConfirm} isLoading={isLoading}>
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <p className="text-sm text-gray-500">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;

