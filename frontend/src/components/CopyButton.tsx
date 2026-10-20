import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  text: string;
  label?: string;
  onToast?: (msg: string) => void;
  size?: number;
}

export const CopyButton: React.FC<Props> = ({ text, label, onToast, size = 13 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) onToast(`Copied ${label || text.slice(0, 10) + '...'} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label || text}`}
      style={{
        background: 'none',
        border: 'none',
        padding: '2px 4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        color: copied ? 'var(--brand-emerald)' : 'var(--text-muted)',
        borderRadius: '4px',
        transition: 'color 0.15s ease'
      }}
    >
      {copied ? <Check size={size} color="var(--brand-emerald)" /> : <Copy size={size} />}
    </button>
  );
};
