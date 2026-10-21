import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, MinusCircle } from 'lucide-react';

/**
 * StatusBadge Component
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} variant
 */
export function StatusBadge({
  children,
  variant = 'neutral',
  icon = null,
  showDefaultIcon = true,
  className = ''
}) {
  const defaultIcons = {
    success: <CheckCircle2 size={12} aria-hidden="true" />,
    warning: <AlertTriangle size={12} aria-hidden="true" />,
    danger: <AlertCircle size={12} aria-hidden="true" />,
    info: <Info size={12} aria-hidden="true" />,
    neutral: <MinusCircle size={12} aria-hidden="true" />
  };

  const renderedIcon = icon || (showDefaultIcon ? defaultIcons[variant] : null);

  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {renderedIcon}
      <span>{children}</span>
    </span>
  );
}

export default StatusBadge;
