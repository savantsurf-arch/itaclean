import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface StockBadgeProps {
  status?: StockStatus;
  quantity?: number;
  lowStockThreshold?: number;
  className?: string;
  showIcon?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  status,
  quantity,
  lowStockThreshold = 5,
  className = '',
  showIcon = true,
}) => {
  // Resolve status from quantity if provided, else use status prop (defaults to 'in-stock')
  let resolvedStatus: StockStatus = status || 'in-stock';
  if (typeof quantity === 'number') {
    if (quantity <= 0) {
      resolvedStatus = 'out-of-stock';
    } else if (quantity <= lowStockThreshold) {
      resolvedStatus = 'low-stock';
    } else {
      resolvedStatus = 'in-stock';
    }
  }

  if (resolvedStatus === 'out-of-stock') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 ${className}`}
        role="status"
        aria-label="Produto Indisponível"
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Indisponível</span>
      </span>
    );
  }

  if (resolvedStatus === 'low-stock') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 ${className}`}
        role="status"
        aria-label="Poucas unidades no estoque"
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Poucas unidades no estoque</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 ${className}`}
      role="status"
      aria-label="Em estoque (Pronta entrega)"
    >
      {showIcon && <Check className="w-3.5 h-3.5 shrink-0" />}
      <span>Em estoque (Pronta entrega)</span>
    </span>
  );
};
