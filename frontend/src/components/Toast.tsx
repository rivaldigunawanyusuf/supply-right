import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Props {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<Props> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      background: 'var(--brand-pine)',
      color: '#ffffff',
      padding: '10px 18px',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 8px 24px rgba(6, 78, 59, 0.35)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.825rem',
      fontWeight: 600,
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      <CheckCircle2 size={16} color="var(--brand-mint)" />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: '2px',
            marginLeft: '6px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
