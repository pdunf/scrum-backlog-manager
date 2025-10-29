'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantColors = {
    danger: 'var(--color-status-blocked)',
    warning: 'var(--color-status-progress)',
    info: 'var(--color-primary)',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel}
    >
      <div
        className="card max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white' }}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded font-medium transition-colors text-white"
            style={{ backgroundColor: variantColors[variant] }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}