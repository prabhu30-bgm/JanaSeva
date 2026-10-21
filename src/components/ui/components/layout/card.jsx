import React from 'react';

export function Card({
  title,
  action,
  children,
  className = '',
  ...props
}) {
  return (
    <article className={`card ${className}`.trim()} {...props}>
      {(title || action) && (
        <header className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </header>
      )}
      <div className="card-content">{children}</div>
    </article>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ''
}) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header-info">
        {breadcrumbs && (
          <div className="breadcrumbs" style={{ marginBottom: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {Array.isArray(breadcrumbs) ? (
              breadcrumbs.map((b, idx) => (
                <span key={idx}>
                  {idx > 0 && <span style={{ margin: '0 6px', color: '#9CA3AF' }}>/</span>}
                  {typeof b === 'string' ? (
                    b
                  ) : b?.href && !b?.active ? (
                    <a href={b.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {b.label}
                    </a>
                  ) : (
                    <span style={{ color: b?.active ? 'var(--color-text-primary)' : 'inherit', fontWeight: b?.active ? 600 : 400 }}>
                      {b?.label || ''}
                    </span>
                  )}
                </span>
              ))
            ) : (
              breadcrumbs
            )}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  action,
  className = ''
}) {
  return (
    <div className={`section-header-wrap ${className}`.trim()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h2 className="section-header" style={{ margin: 0 }}>{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Divider({ className = '' }) {
  return <hr className={`divider ${className}`.trim()} aria-hidden="true" />;
}
