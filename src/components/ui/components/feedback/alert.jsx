import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { Button } from '../Button/Button';

function resolveIcon(icon, fallback, size = 18) {
  if (React.isValidElement(icon)) return icon;
  if (icon) return React.createElement(icon, { size, 'aria-hidden': 'true' });
  return fallback;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  className = ''
}) {
  const defaultIcons = {
    success: <CheckCircle2 size={18} aria-hidden="true" />,
    warning: <AlertTriangle size={18} aria-hidden="true" />,
    danger: <AlertCircle size={18} aria-hidden="true" />,
    info: <Info size={18} aria-hidden="true" />
  };

  const renderedIcon = resolveIcon(icon, defaultIcons[variant]);

  return (
    <div className={`alert alert-${variant} ${className}`.trim()} role="alert">
      {renderedIcon && (
        <span className="alert-icon" style={{ flexShrink: 0, marginTop: '2px' }}>
          {renderedIcon}
        </span>
      )}
      <div className="alert-content">
        {title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Banner({
  variant = 'warning',
  title,
  message,
  children,
  action,
  icon,
  onDismiss,
  className = ''
}) {
  const defaultIcons = {
    warning: <AlertTriangle size={18} aria-hidden="true" />,
    danger: <AlertCircle size={18} aria-hidden="true" />,
    info: <Info size={18} aria-hidden="true" />
  };

  const renderedIcon = resolveIcon(icon, defaultIcons[variant]);

  return (
    <aside className={`banner banner-${variant} ${className}`.trim()} role="region" aria-label="Announcement">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
        {renderedIcon && <span style={{ flexShrink: 0, marginTop: '2px' }}>{renderedIcon}</span>}
        <div>
          {title && <strong style={{ display: 'block', marginBottom: '2px' }}>{title}</strong>}
          <div>{message || children}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {action}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: '4px',
              fontSize: '16px',
              lineHeight: 1
            }}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        )}
      </div>
    </aside>
  );
}

export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`spinner ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}) {
  const renderedIcon = resolveIcon(icon, null, 40);

  return (
    <div className={`empty-state ${className}`.trim()}>
      {renderedIcon && <div className="state-icon">{renderedIcon}</div>}
      {title && <h3 className="state-title">{title}</h3>}
      {description && <p className="state-desc">{description}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this view. Please try again.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`error-state ${className}`.trim()} role="alert">
      <div className="state-icon" style={{ color: 'var(--color-danger)' }}>
        <AlertCircle size={40} aria-hidden="true" />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RefreshCw size={16} />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
